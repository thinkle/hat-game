const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})

async function faunaQuery (query) {
    try {
        const response = await client.query(query);
        return {
            statusCode : 200,
            body : JSON.stringify(response)
        }
    }
    catch (err) {
        console.log('ERROR: ',err);
        return {
            statusCode : 400,
            error: JSON.stringify(err)
        }
    }
}



exports.handler = async (event, context) => {
    let params;
    if (event.httpMethod !== 'POST') {
        params = event.queryStringParameters;
    }
    else {
        params = JSON.parse(event.body);
    }
    //const gameId = params.id // event.path.match(/([^\/]*)\/*$/)[0];
    const dataParams = [
        'step','title','startTime','currentPlayer','players'
    ]
    if (params.mode == 'setup') {
        return doSetup();
    }
    if (params.mode == 'new') {
        return newGame();
    }
    else if (params.data) {
        return updateGame(params.id,params.data);
    }
    else if (dataParams.find((p)=>params[p])) {
        const dataToUpdate = {}
        for (let p of dataParams) {
            if (params[p]) {
                dataToUpdate[p] = params[p]
            }
        }
        return updateGame(params.id,dataToUpdate);
    }
    else if (params.id) {
        return getGame(params.id);
    }
    else {
        console.log('No valid mode given with request',params)
        return {
            statusCode : 400,
            body : 'No valid mode or id given',
        }
    }
}

async function updateGame (id, newData) {
    return faunaQuery(
      q.Update(
                q.Ref(`classes/Games/${id}`),
                {data:newData}
            )
    );
}

async function newGame () {
    const gameItem = {
        data : {
            title:'New Game',
            step:'Add words',
        }
    }
    return faunaQuery(
        q.Create(
            q.Ref('classes/Games'),
            gameItem
        )
    );
}

async function getGame (gameId) {
    return faunaQuery(
        q.Get(q.Ref(`classes/Games/${gameId}`))
    );
}


async function doSetup () {
    try {
    var resp = await client.query(
        q.CreateIndex({
            name : 'words_by_session',
            source : q.Ref('classes/Words'),
            terms : [
                {field: ['data','session']}
            ],
        })
    );
    }
    catch (err) {
        console.log('Err with first index',err);
    }
    try {
    var resp2 = await client.query(
        q.CreateIndex({
            name : 'words_in_hat_by_session',
            source : q.Ref('classes/Words'),
            terms : [{field: ['data','session']},
                     {field: ['data','outOfHat']}],
            values : [
                {field:['ref','id']},
                {field:['data','word']}
            ]
        })
    );
    }
    catch (err) {
        console.log('err with second index',err);
    }
    return {statusCode:200,
            body:JSON.stringify({
                resp : resp,
                resp2 : resp2,
                result:'indexes created'
            })}
}
