const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})

async function faunaQuery (query, responseTemplate={}) {
    try {
        const response = await client.query(query);
        Object.assign(responseTemplate,response);
        //console.log('success!',responseTemplate);
        return {
            statusCode : 200,
            body : JSON.stringify(responseTemplate)
        }
    }
    catch (err) {
        console.log('failure',err);
        return {
            statusCode : 400,
            error: JSON.stringify(err)
        } 
    }
}

exports.handler = async (event, context) => {
    console.log('responding...');
    if (event.httpMethod !== 'POST') {
        console.log('Not a post!',event);
        return {
            statusCode : 400,
            body : JSON.stringify({error : 'Request must be a post'}),
        }
    }
    try {
        var data = JSON.parse(event.body)
    }
    catch (err) {
        return {
            statusCode : 400,
            body : JSON.stringify({
                error : 'Error parsing JSON',
                parseError : JSON.stringify(err),
                body : event.body
            })
        }
    }
    console.log('Got request data: ',data);
    if (data.mode=='list') {
        return await listWords(data)
    }
    if (data.mode=='add') {
        return await addWord(data)
    }
    if (data.mode=='delete') {
        return await deleteWord(data)
    }
    if (data.mode=='edit') {
        return await editWord(data)
    }
    if (data.mode=='pull') {
        return await pullRandomWord(data)
    }
    if (data.mode=='outAndList') {
        await removeWordFromHat(data);
        return await listWords(data);
    }
    if (data.mode=='trade') {
        return await tradeWordForRandomWord(data)
    }
    if (data.mode=='reset') {
        await putAllWordsBack(data);
        return await listWords(data);
    }
    if (data.mode=='out') {
        return await removeWordFromHat(data);
    }
    if (data.mode=='in') {
        return await putWordBackInHat(data)
    }
    else {
        return {
            statusCode : 200,
            error : 'No mode specified: must be add/delete/edit/out/in'
        }
    }
}

async function listWords ({session}) {
    return faunaQuery(
        q.Map(
            q.Paginate(
                q.Match(q.Index('words_by_session'),session)),
            q.Lambda('word',q.Get(q.Var('word'))))
    );
    //     q.Map(
    //         q.Paginate(
    //             q.Match(q.Index('words_by_session'),session)
    //         ),
    //         q.Lambda(
    //             'word',
    //             q.Get(q.Var('word'))
    //         )
    //     )
                
    // );
}

async function addWord ({word, session, category='name'}) {
    return faunaQuery(
        q.Create(
            q.Ref('classes/Words'),
            {
                data: {
                    word, session, category, outOfHat:false,
                }
            }
        )
    );
}

async function putAllWordsBack({session}) {
    const response = await client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index('words_by_session'),session)
            ),
            q.Lambda('word',q.Update(q.Var('word'),{data:{outOfHat:false}}))
        )
    );
    console.log('Put them back... got response:',response);
    return {
        statusCode : 400,
        body: JSON.stringify({
            response
        })
    }
    
}

async function tradeWordForRandomWord ({session, id}) {
    var intermediateResponse = await putWordBackInHat({id});
    return await pullRandomWord({session});
}

async function pullRandomWord ({session}) {
    const resp = await client.query(
        q.Paginate(q.Match(q.Index("words_in_hat_by_session"), session, false))
    );
    if (resp.data.length > 1) {
        const idx = Math.floor(Math.random() * resp.data.length);
        const [id,word] = resp.data[idx];
        return await removeWordFromHat({id,count:resp.data.length});
    }
    else {
        return {
            statusCode : 200,
            body : JSON.stringify({
                error : 'No words left',
            }),
        }
    }
}

async function putWordBackInHat ({id}) {
    return faunaQuery(
        q.Update(
                q.Ref(`classes/Words/${id}`),
            {data:{
                outOfHat : false,
                }}
            )
    );
}

async function removeWordFromHat ({id, count}) {
    return faunaQuery(
        q.Update(
                q.Ref(`classes/Words/${id}`),
            {data:{
                outOfHat : true
            }}
        ),
        {wordsLeft:count-1}
    );
}

async function deleteWord ({id, session}) {
    console.log('Removing word...',id);
    return faunaQuery(
        q.Delete(
            q.Ref(`classes/Words/${id}`)
        )
    );
}

async function editWord ({id, session, word, category}) {
    return faunaQuery(
        q.Update(
                q.Ref(`classes/Words/${id}`),
                {data:{
                    word:word,
                    category:category
                }}
            )
    );
}

