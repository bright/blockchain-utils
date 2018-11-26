const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

class Signer {

    private readonly nodeUrl: string;

    constructor(nodeUrl: string) {
        this.nodeUrl = nodeUrl;
    }

    async signAndSendTransaction(data: any, senderAddress: string, senderPrivateKey: string, gas: string, nonce: string, contractAddress: string): Promise<any> {

        if (!data || !senderAddress || !senderPrivateKey || !gas) {
            throw new Error(`Missing data for signAndSendTransaction call: senderAddress='${senderAddress}', gas='${gas}' data: ${data}`)
        }

        let privateKeyBuffer = Buffer.from(senderPrivateKey.slice(2), 'hex');
        let nonceHex = "0x" + Number(nonce).toString(16);

        let rawTx = {
            gas: gas,
            nonce: nonceHex,
            data: data,
            from: senderAddress,
            to: undefined
        };

        if (contractAddress) {
            rawTx.to = contractAddress
        }

        const tx = new Tx(rawTx);
        tx.sign(privateKeyBuffer);

        const signedTransactionHash = `Ox${tx.hash().toString('hex')}`;
        console.log("Signed transaction hash:", signedTransactionHash);

        const serializedTx = tx.serialize();

        let web3Instance = new Web3(new Web3.providers.HttpProvider(this.nodeUrl));

        return new Promise<any>((resolve, reject) => {
            web3Instance.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
                if (!err) {
                    console.log(`Send transaction finished, hash: ${hash}`);
                    resolve({hash, nonce});
                } else {
                    console.log(`Send transaction error: ${err}, hash: ${hash}`);
                    reject(err);
                }
            })
        })
    }
}

module.exports = Signer;