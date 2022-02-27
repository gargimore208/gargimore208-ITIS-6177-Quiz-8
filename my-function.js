exports.handler = async (event) => {
    const result = "Gargi More says "+ event.queryStringParameters.keyword
    const response = {
        statusCode: 200,
        body: JSON.stringify(result),
    };
    return response;
};
