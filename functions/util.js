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
        return {
            statusCode : 400,
            error: JSON.stringify(err)
        }
    }
}
