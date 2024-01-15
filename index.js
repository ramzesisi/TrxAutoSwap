const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;

const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = ""; // Ваш приватный ключ
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

const functionSelector = 'swapExactETHForTokens(uint256,address[],address,uint256)';
const contractAddress = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax"; // Адрес контракта свапа
const wrappedtrxaddress = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
const tokentoswap = "TDBFbYyw9LPQNyMALeKtrzz7Wm5Uwki96D"; // В какой токен своп
const publicaddr = "TXi1VJSQjwdnuneLSR1NnjeScPadid79c2"; // Ваш адрес
const amountToSend = 250; // Количество TRX для отправки

async function sendSwapTransactions(repetitions, delay) {
    for (let i = 0; i < repetitions; i++) {
        const now = new Date();
        const thirtyMinutesLater = new Date(now.getTime() + 1800000);
        const deadline = Math.floor(thirtyMinutesLater.getTime() / 1000);
        const amountInSun = tronWeb.toSun(amountToSend);

        const parameter = [
            {type:'uint256', value:'0'}, // amountOutMin 100% slipage
            {type:'address[]', value:[wrappedtrxaddress, tokentoswap]}, // path
            {type:'address', value:publicaddr}, // to
            {type:'uint256', value:deadline.toString()} // deadline
        ];
        const options = {
            feeLimit: 250000000, // Лимит комиссии
            callValue: amountInSun, // Количество в Sun
            shouldPollResponse: false
        };
        
        const tx = await tronWeb.transactionBuilder.triggerSmartContract(
            contractAddress, 
            functionSelector, 
            options, 
            parameter
        );
        const signedTx = await tronWeb.trx.sign(tx.transaction);
        console.log("Транзакция", i + 1, "подписана =>", signedTx);
        
        await new Promise(resolve => setTimeout(resolve, delay));

        const ret = await tronWeb.trx.sendRawTransaction(signedTx);
        console.log("Транзакция", i + 1, "отправлена => TxId:", ret.txid);
    }
}

const repetitions = 100; // Количество повторений
const delayBetweenTransactions = 1000; // Задержка в миллисекундах
sendSwapTransactions(repetitions, delayBetweenTransactions)
    .then(() => {
        console.log("Все транзакции swap отправлены успешно.");
    })
    .catch((err) => {
        console.error("Ошибка:", err);
    });