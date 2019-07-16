const fs = require('fs');

var amqp = require('amqplib/callback_api');

var completed_dir = "/home/user/Documentos/completed/";

var keypointsBody25 = {
    NOSE: 0,
    NECK: 1,
    RSHOULDER: 2,
    RELBOW: 3,
    RWRIST: 4,
    LSHOULDER: 5,
    LELBOW: 6,
    LWRIST: 7,
    MIDHIP: 8,
    RHIP: 9,
    RKNEE: 10,
    RANKLE: 11,
    LHIP: 12,
    LKNEE: 13,
    LANKLE: 14,
    REYE: 15,
    LEYE: 16,
    REAR: 17,
    LEAR: 18,
    LBIGTOE: 19,
    LSMALLTOE: 20,
    LHEEL: 21,
    RBIGTOE: 22,
    RSMALLTOE: 23,
    RHEEL: 24,
    BACKGROUND: 25,
    properties: {
        0: { name: "NOSE" },
        1: { name: "NECK" },
        2: { name: "RSHOULDER" },
        3: { name: "RELBOW" },
        4: { name: "RWRIST" },
        5: { name: "LSHOULDER" },
        6: { name: "LELBOW" },
        7: { name: "LWRIST" },
        8: { name: "MIDHIP" },
        9: { name: "RHIP" },
        10: { name: "RKNEE" },
        11: { name: "RANKLE" },
        12: { name: "LHIP" },
        13: { name: "LKNEE" },
        14: { name: "LANKLE" },
        15: { name: "REYE" },
        16: { name: "LEYE" },
        17: { name: "REAR" },
        18: { name: "LEAR" },
        19: { name: "LBIGTOE" },
        20: { name: "LSMALLTOE" },
        21: { name: "LHEEL" },
        22: { name: "RBIGTOE" },
        23: { name: "RSMALLTOE" },
        24: { name: "RHEEL" },
        25: { name: "BACKGROUND" }
    }
}

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'process';

        ch.assertQueue(q, { durable: false });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

        ch.consume(q, function (msg) {

            console.log(" [x] Received %s", msg.content.toString());

            processFile(msg.content.toString()).then(() => {
                console.log(" [v] Done");
                ch.ack(msg);
            });

        }, { noAck: false });

    });
});

async function processFile(fileName) {
    var file = fs.readFileSync(`${completed_dir}${fileName}.json`);
    var data = JSON.parse(file);
    var quadros = { quadros: [] };
    data.forEach((quadro, idQuadro) => {
        var pessoas = [];
        quadro.forEach((pessoa, idPessoa) => {
            var pontos = [];
            pessoa.forEach((ponto, idPonto) => {
                var pontoName = "";
                pontoName = keypointsBody25.properties[idPonto].name;
                ponto = ponto[0] === 0 && ponto[1] === 0 && ponto[2] === 0 ? verifyAndReturnPoint(data, idQuadro, idPessoa, idPonto) : ponto;
                pontos.push({
                    ponto: pontoName,
                    x: ponto[0],
                    y: ponto[1],
                    acc: ponto[2]
                })
            });
            pessoas.push({
                idPessoa: idPessoa,
                pontos: pontos
            })
        })
        quadros.quadros.push({
            idQuadro: idQuadro,
            pessoas: pessoas
        })
    })
    return await fs.writeFileSync(`${completed_dir}${fileName}-data.json`, JSON.stringify(quadros));
}


function verifyAndReturnPoint(data, idQuadro, idPessoa, idPonto) {
    if (
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][0] != undefined && data[idQuadro][idPessoa][idPonto][0] === 0) &&
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][1] != undefined && data[idQuadro][idPessoa][idPonto][1] === 0) &&
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][2] != undefined && data[idQuadro][idPessoa][idPonto][2] === 0) &&
        idQuadro > 0
    ) {
        return verifyAndReturnPoint(data, idQuadro - 1, idPessoa, idPonto);
    } else if (
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][0] != undefined && data[idQuadro][idPessoa][idPonto][0] > 0) ||
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][1] != undefined && data[idQuadro][idPessoa][idPonto][1] > 0) ||
        (data != undefined && data[idQuadro] != undefined && data[idQuadro][idPessoa] != undefined && data[idQuadro][idPessoa][idPonto] != undefined && data[idQuadro][idPessoa][idPonto][2] != undefined && data[idQuadro][idPessoa][idPonto][2] > 0)
    ) {
        return data[idQuadro][idPessoa][idPonto];
    } else {
        return [0, 0, 0];
    }
}