const express = require('express');
const app = express();
var cors = require('cors')
const { check, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var shortid = require('shortid');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
  '/docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);
app.use(cors());

const mariadb = require('mariadb');
const { default: axios } = require('axios');
const pool = mariadb.createPool({
	host: "143.244.144.94",
	user: 'root',
	password: 'password',
	database:'sample',
	port: 3306,
	connectionLimit: 5
});




app.get("/api/getAllAgents",async(req,res)=>{

   let conn = null;
   try {
	conn = await pool.getConnection();
	const rows = await conn.query("SELECT * from agents");
	res.json(rows);

  } catch (err) {
	throw err;
  } finally {
	if (conn) return conn.end();
  }
});

app.get("/api/getAllCompanies",async(req,res)=>{

   let conn = null;
   try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * from company");
        res.json(rows);

  } catch (err) {
        throw err;
  } finally {
        if (conn) return conn.end();
  }
});

app.get("/api/getAgentsByWorkingArea/:workingArea",async(req,res)=>{
   let workingArea = req.params.workingArea;
   let conn = null;
   try {
	console.log("inside");
        conn = await pool.getConnection();
	let query = `SELECT * from agents where working_area='${workingArea}'`;
        const rows = await conn.query(query);
	res.json(rows);

  } catch (err) {
        throw err;
  } finally {
        if (conn) return conn.end();
  }
});

const validateAgent=[
    check("AGENT_NAME").isString().withMessage("Agent name should be string")
    .exists()
    .isLength( { min: 2 , max:40}).withMessage("Agent name length should between 2 to 40")
    .trim().escape(),
    check("WORKING_AREA").isString().withMessage("WORKING AREA name should be string")
    .exists()
    .isLength( { min: 2 , max:35}).withMessage("WORKING AREA  length should between 2 to 35")
    .trim().escape(),
    check("COMMISSION").isFloat().withMessage("COMMISSION must be float")
    .exists(),
    check("PHONE_NO").isMobilePhone().withMessage("Not valid phone number"),
    check("COUNTRY").isString().withMessage("COUNTRY should be string")
    .exists()
    .isLength( { min: 2 , max:25}).withMessage("COUNTRY length should between 2 to 25")
    .trim().escape()
];
const validateAgentPatch=[
    check("AGENT_NAME").isString().withMessage("Agent name should be string")
    .isLength( { min: 2 , max:40}).withMessage("Agent name length should between 2 to 40")
    .trim().escape(),
    check("WORKING_AREA").isString().withMessage("WORKING AREA name should be string")
    .isLength( { min: 2 , max:35}).withMessage("WORKING AREA  length should between 2 to 35")
    .trim().escape(),
    check("COMMISSION").isFloat().withMessage("COMMISSION must be float"),
    check("PHONE_NO").isMobilePhone().withMessage("Not valid phone number"),
    check("COUNTRY").isString().withMessage("COUNTRY should be string")
    .isLength( { min: 2 , max:25}).withMessage("COUNTRY length should between 2 to 25")
    .trim().escape()
];


app.post("/api/addAgent",validateAgent,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
	}
    try {
        const AGENT_CODE = shortid.generate().slice(-6);
        conn = await pool.getConnection();
        let query = `INSERT INTO agents VALUES('${AGENT_CODE}','${req.body.AGENT_NAME}','${req.body.WORKING_AREA}',
        '${req.body.COMMISSION}','${req.body.PHONE_NO}','${req.body.COUNTRY}')`;
        const rows = await conn.query(query);
        res.json(rows);
    } catch (err) {
            throw err;
    } finally {
            if (conn) return conn.end();
    }
})

app.patch("/api/patchAgent/:id",validateAgentPatch,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
	}
    try {
        let AGENT_CODE = req.params.id;
        conn = await pool.getConnection();
        let queryCheck = `SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`;
        const rowsCheck = await conn.query(queryCheck);
        if(rowsCheck.length == 0){
            res.status(400).send({"message":"Invalid Agent Id"});
        }
        let query = `Update agents set 
        AGENT_NAME='${req.body.AGENT_NAME}',
        WORKING_AREA='${req.body.WORKING_AREA}',
        COMMISSION='${req.body.COMMISSION}',
        PHONE_NO='${req.body.PHONE_NO}',
        COUNTRY='${req.body.COUNTRY}' 
        where AGENT_CODE='${AGENT_CODE}'`;
        const rows = await conn.query(query);
        res.json(rows);
    } catch (err) {
            throw err;
    } finally {
            if (conn) return conn.end();
    }
})

app.put("/api/updateAgent/:id",validateAgent,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
	}

    try {
        let AGENT_CODE = req.params.id;
        conn = await pool.getConnection();
        let queryCheck = `SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`;
        const rowsCheck = await conn.query(queryCheck);
        if(rowsCheck.length == 0){
            res.status(400).send({"message":"Invalid Agent Id"});
        }
        let query = `Update agents set 
        AGENT_NAME='${req.body.AGENT_NAME}',
        WORKING_AREA='${req.body.WORKING_AREA}',
        COMMISSION='${req.body.COMMISSION}',
        PHONE_NO='${req.body.PHONE_NO}',
        COUNTRY='${req.body.COUNTRY}' 
        where AGENT_CODE='${AGENT_CODE}'`;
        const rows = await conn.query(query);
        res.json(rows);
    } catch (err) {
            throw err;
    } finally {
            if (conn) return conn.end();
    }
})

app.delete("/api/deleteAgent/:id",async(req,res)=>{
    console.log("inside");
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
	}
    try { 
        let AGENT_CODE = req.params.id;
        conn = await pool.getConnection();
        let queryCheck = `SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`;
        const rowsCheck = await conn.query(queryCheck);
        if(rowsCheck.length == 0){
            res.status(400).send({"message":"Invalid Agent Id"});
        }
        let query = `Delete * from agents where AGENT_CODE='${AGENT_CODE}'`;
            const rows = await conn.query(query);
        res.json(rows);

    } catch (err) {
            throw err;
    } finally {
            if (conn) return conn.end();
    }
})

app.get("/say",async(req,res)=>{
   const url = "https://5mi5fd3f51.execute-api.us-east-1.amazonaws.com/hello_name?keyword="+req.query.keyword;
   console.log("inside");
   axios.get(url)
   .then((response)=>{
        res.send(response.data);
   }).catch((error)=>{
        console.log(error);
        res.send(error);
   })
});

let port = 3000;

app.listen(port,()=>{
   console.log(`started listening on port number ${port}.`);
})
