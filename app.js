$(document).ready(function () {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        alert("Please install MetaMask to use this application.");
    }

    const contractAddress = '0x404291AdC5a7fa3B0D22A001F778e8Db8B33e266';
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_goalWei",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_deadline",
                    "type": "uint256"
                }
            ],
            "name": "createFundraiser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "f",
                    "type": "address"
                }
            ],
            "name": "donate",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdrawFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "fundraiserDonations",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "donor",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "fundraiserKeys",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "fundraisers",
            "outputs": [
                {
                    "internalType": "address payable",
                    "name": "wallet",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "goal",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountRaised",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "withdrawn",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getAllFundraisers",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "wallets",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "f",
                    "type": "address"
                }
            ],
            "name": "getDonations",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "f",
                    "type": "address"
                }
            ],
            "name": "getFundraiserInfo",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    
    const crowdfundingContract = new web3.eth.Contract(contractABI, contractAddress);
    
    function getAllFundraisers() {
        return crowdfundingContract.methods.getAllFundraisers().call();
    }

    async function loadFundraisers() {
        const fundraisersDiv = $('#fundraisers');
        fundraisersDiv.empty();

        const wallets = await getAllFundraisers();
        const loggedInUser = await web3.eth.getCoinbase();
        console.log(wallets);

        for (const wallet of wallets) {
            if(parseInt(wallet, 16) === 0) continue;

            const info = await crowdfundingContract.methods.getFundraiserInfo(wallet).call();
            const progress = (info[2] / info[0]) * 100;
            console.log(info)
            const isFundraiser = wallet.toLowerCase() === loggedInUser.toLowerCase();
            const withdrawButton = isFundraiser ? '<button onclick="withdrawFunds(\'' + wallet + '\')">Withdraw Funds</button>' : '';


            const fundraiserHTML = `
                <div class="fundraiser-card">
                    <h2>Fundraiser Details</h2>
                    <hr>
                    <p><strong>Wallet:</strong> ${wallet}</p>
                    <p><strong>Goal:</strong> ${web3.utils.fromWei(info[0], 'ether')} ETH</p>
                    <p><strong>Deadline:</strong> ${new Date(info[1] * 1000).toLocaleString()}</p>
                    <p><strong>Amount Raised:</strong> ${web3.utils.fromWei(info[2], 'ether')} ETH</p>
                    <p><strong>Progress:</strong> ${progress.toFixed(2)}%</p>
                    <div class="button-container">
                        <button class="donate-button" onclick="donate('${wallet}')">Donate</button>
                        ${withdrawButton}
                    </div>
                </div>
            `;

            fundraisersDiv.append(fundraiserHTML);
        }
    }

    // Function to handle donation
    window.donate = async function(wallet) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const amount = prompt("Enter the donation amount in ETH:");
        if(amount == null) return
        try {
            await crowdfundingContract.methods.donate(wallet).send({
                value: web3.utils.toWei(amount, 'ether'),
                from: accounts[0]
            });
        }
        catch(e) {
            console.log(e)
        }
        console.log('Donated successfully')
        loadFundraisers();
    };

    window.addFundraiser = async function(wallet) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const goal = $('#goal').val();
        const deadline = new Date($('#deadline').val()).getTime() / 1000;

        try {
            await crowdfundingContract.methods.createFundraiser(
                web3.utils.toWei(goal.toString(), 'ether'),
                Math.floor(deadline)
            ).send({
                from: accounts[0]
            });
        } catch (e) {
            console.error(e);
        }

        console.log('create');
    };

    // Function to handle withdrawing funds
    window.withdrawFunds = async function(wallet) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        try {
            await crowdfundingContract.methods.withdrawFunds().send({
                from: accounts[0]
            });
        }
        catch(e) {
            console.log(e)
        }

        console.log('Withdrawn successfully')
        loadFundraisers();
    };

    loadFundraisers();
});
