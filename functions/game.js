//const querystring = require('querystring');
//console.log('querystring is ',querystring);
const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})

async function faunaQuery (query) {
    try {
        const response = await client.query(query);
        console.log('Successful response: ',response);
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
    console.log('game called in context',JSON.stringify(context));
    console.log('queryStringParameters=',event.queryStringParameters);
    if (event.httpMethod !== 'POST') {
        console.log('use parameters from queryString');
        params = event.queryStringParameters;
    }
    else {
        console.log('use post body');
        params = JSON.parse(event.body);
    }
    //const gameId = params.id // event.path.match(/([^\/]*)\/*$/)[0];
    console.log('params=',params);
    const dataParams = [
        'step','title','startTime','currentPlayer','players'
    ]
    if (params.mode == 'setup') {
        return doSetup();
    }
    if (params.mode == 'new') {
        console.log("NEW!");
        return newGame();
    }
    else if (params.data) {
        console.log("UPDATE W DATA!");
        return updateGame(params.id,params.data);
    }
    else if (dataParams.find((p)=>params[p])) {
        const dataToUpdate = {}
        for (let p of dataParams) {
            if (params[p]) {
                dataToUpdate[p] = params[p]
            }
        }
        console.log("UPDATE W PARAMS!");
        return updateGame(params.id,dataToUpdate);
    }
    // else if (params.startTime) {
    //     console.log('UPDATE TIMER!');
    //     return await updateGame(params.id,{startTime:''+params.startTime,timerLength:''+params.timerLength});
    // }
    // else if (params.currentPlayer||params.) {
    //     const data = {currentPlayer:params.currentPlayer}
    //     return await updateGame(params.id,{currentPlayer})
    // }
    else if (params.id) {
        console.log("RETRIEVE FROM ID (fallback)!");
        return getGame(params.id);
    }
    else {
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
