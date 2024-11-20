const express = require('express');
const sql = require('mssql');
const app = express();
const nodemailer = require('nodemailer');
const config = require('./dbConfig');
const multer = require('multer');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/images', express.static('public/images/'));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });
//--------------- 尝试连接数据库---------------------
const poolPromise = sql.connect(config).then(pool => {
    console.log('数据库连接池已建立');
    return pool;
}).catch(err => {
    console.error('数据库连接失败:', err);
});
async function testConnection() {
    try {
        await sql.connect(config);
        console.log('连接成功！');
    } catch (err) {
        console.error('连接失败:', err);
    }
}
testConnection();
//------------------------------------------------------------
//展示商品
app.get('/products', async (req, res) => {
    try {
        const pool = await poolPromise;
        const resultproducts = await pool.request()
            .query('SELECT id, pname, price, img_url FROM product');
        // 将查询结果发送到前端
        res.json(resultproducts.recordset);
    } catch (err) {
        console.error('查询错误:', err);
        res.status(500).send('数据库查询失败');
    }
});
//用户注册插入
app.post('/Userregister', async (req, res) => {
    const { insertType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(insertType);
        // 检查是否插入成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '注册成功'
            });
        } else {
            return res.json({ success: false, message: '注册失败' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
});
//用户注册后创建一个该用户的购物车表
app.post('/createUserPaycart', async (req, res) => {
    const { Emailtext } = req.body;
    // 创建一个新的表格，表名为用户邮箱加上 "cart"
    const tableName = `[cart_${Emailtext}]`; // 使用方括号来处理动态表名，避免 SQL 注入风险
    const createTable = ` CREATE TABLE ${tableName} (
                    id VARCHAR(50) PRIMARY KEY,
                    pname VARCHAR(100) not null,
                    price DECIMAL(15, 2) NOT NULL,
                    img_url VARCHAR(255) not null,
                    count int not null,
                )`
    try {
        const pool = await poolPromise;
        await pool.request().query(createTable);
        return res.json({
            success: true,
            message: '购物车表创建成功'
        });
    } catch (err) {
        console.error('创建表失败:', err);
        return res.status(500).json({ success: false, message: '创建购物车表失败' });
    }
});
//用户注册后创建一个该用户的历史订单表
app.post('/createUserOrder', async (req, res) => {
    const { Emailtext } = req.body;
    // 创建一个新的表格，表名为用户邮箱加上 "Order"
    const tableName = `[order_${Emailtext}]`; // 使用方括号来处理动态表名，避免 SQL 注入风险
    const createTable = ` CREATE TABLE ${tableName} (
                    orderId VARCHAR(255) NOT NULL PRIMARY KEY,
                    ordertime VARCHAR(255) NOT NULL,
                    id VARCHAR(50),
                    pname VARCHAR(100),
                    price DECIMAL(15, 2) NOT NULL,
                    img_url VARCHAR(255),
                    count int,
                    status VARCHAR(50)
                )`
    try {
        const pool = await poolPromise;
        await pool.request().query(createTable);
        console.log(Emailtext + '注册成功')
        return res.json({
            success: true,
            message: '历史订单表创建成功'
        });
    } catch (err) {
        console.error('创建表失败:', err);
        return res.status(500).json({ success: false, message: '创建历史订单表失败' });
    }
});
//---------------用户or管理员登陆检测--------------------------------
app.post('/Userlogin', async (req, res) => {
    const { Email, searchType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            const userData = result.recordset[0]
            console.log(Email + '用户登录成功')
            return res.json({
                success: true,
                message: '登录成功',
                data: userData
            });
        } else {
            return res.json({ success: false, message: '邮箱或密码错误' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '登录繁忙，请稍后再试' });
    }
});
app.post('/Managerlogin', async (req, res) => {
    const { Email, searchType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        // 检查是否插入成功
        if (result.recordset.length > 0) {
            const userData = result.recordset[0]
            console.log(Email + '管理员登录成功')
            return res.json({
                success: true,
                message: '登录成功',
                data: userData
            });
        } else {
            return res.json({ success: false, message: '登录失败' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
});
//----------------发送验证码-----------------------------
app.post('/sendcode', (req, res) => {
    const userEmail = req.body.email;
    const Code = GCode();
    // 发送验证码到用户邮箱
    sendEmail(userEmail, Code);
    res.json({ success: true, Code: Code });
});
//邮箱是否使用
app.post('/isEmailUsed', async (req, res) => {
    const { searchType } = req.body;
    try {
        // 从连接池获取连接
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        // 检查查询结果
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                message: '邮箱已被使用',
            });
        } else {
            return res.json({ success: false, message: '未使用该邮箱' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
});
// 创建邮件发送者
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',  // QQ 邮箱的 SMTP 地址
    port: 465,            // QQ 邮箱的 SMTP 端口（SSL 端口）
    secure: true,         // 使用 SSL
    auth: {
        user: '',   // QQ 邮箱地址
        pass: '',  // QQ 邮箱的授权码
    }
});
// 生成6位随机验证码
function GCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位数字验证码
}
// 发送验证码邮件的函数
function sendEmail(Email, code) {
    let mailOptions = {
        from: '2291417732@qq.com',  // 发送者邮箱
        to: Email,         // 接收者邮箱
        subject: '注册验证码',        // 邮件标题
        text: `您的验证码是: ${code}`, // 邮件内容
    };
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return console.log('邮件发送失败：', error);
        }
        console.log('验证码邮件已发送: ' + `${Email}`);
    });
}
//-----------------------------------------------------------------
//用户登录之后查询购物车信息
app.post('/searchCart', async (req, res) => {
    const { userEmail } = req.body;
    const tablename = `[cart_${userEmail}]`
    const searchType = `SELECT *FROM ${tablename} `;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                cart: result.recordset
            });
        }
        else {
            return res.json({ success: false, message: '购物车空空如也' });
        }
    }
    catch (err) {
        console.error('查询购物车失败:', err);
        return res.status(500).json({ success: false, message: '查询购物车失败' });
    }
});
//用户登录后查询历史订单信息
app.post('/searchOrder', async (req, res) => {
    const { userEmail } = req.body;
    const tablename = `[order_${userEmail}]`
    const searchType = `SELECT *FROM ${tablename} `;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                order: result.recordset
            });
        }
        else {
            return res.json({ success: false, message: '历史订单空空如也' });
        }
    }
    catch (err) {
        console.error('查询历史订单失败:', err);
        return res.status(500).json({ success: false, message: '查询历史订单失败' });
    }
});
//删除历史订单
app.post('/deleteOrder', async (req, res) => {
    const { Email, orderID, deleteType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(deleteType);
        if (result.rowsAffected[0] > 0) {
            console.log(Email + '删除订单号为' + orderID + '的历史订单成功')
            return res.json({
                success: true,
                message: '删除成功',
            });
        } else {
            return res.json({ success: false, message: '删除失败' });
        }
    } catch (err) {
        console.error('删除失败:', err);
        return res.status(500).json({ success: false, message: '删除失败' });
    }
});
//更新购物车
app.post('/updatecart', async (req, res) => {
    const { updateType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(updateType);
        // 检查是否插入成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '更新成功'
            });
        } else {
            return res.json({ success: false, message: '更新失败' });
        }
    } catch (err) {
        console.error('更新失败:', err);
        return res.status(500).json({ success: false, message: '更新失败' });
    }
});
//更新历史订单
app.post('/insertOrder', async (req, res) => {
    const { insertType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(insertType);
        // 检查是否插入成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '购买成功'
            });
        } else {
            return res.json({ success: false, message: '购买失败' });
        }
    } catch (err) {
        console.error('购买失败:', err);
        return res.status(500).json({ success: false, message: '购买失败' });
    }
});
//--------------------------------------------------
// 管理员上传图片
app.post('/uploadimg', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({
            success: true,
            filePath: `/images/${req.file.filename}`
        });
    } else {
        res.json({
            success: false,
            message: '图片上传失败'
        });
    }
});
//更新商品信息
app.post('/updatePro', async (req, res) => {
    const { updateType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(updateType);
        // 检查是否插入成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '更新成功'
            });
        } else {
            return res.json({ success: false, message: '更新失败' });
        }
    } catch (err) {
        console.error('更新失败:', err);
        return res.status(500).json({ success: false, message: '更新失败' });
    }
});
//管理员查询用户
app.post('/searchUser', async (req, res) => {
    let searchType = 'select * from useraccount'
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                message: '查询成功',
                data: result.recordset
            });
        } else {
            return res.json({ success: false, message: '查询失败' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
})
//管理员查询用户历史订单
app.post('/searchUserOrder', async (req, res) => {
    const { searchType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                message: '查询成功',
                data: result.recordset
            });
        } else {
            return res.json({ success: false, message: '查询失败' });
        }
    } catch (err) {
        console.error('管理员查询历史订单失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
});
//管理员查询管理员历史订单
app.post('/searchManagerOrder', async (req, res) => {
    let searchType = 'select * from managerOrder'
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(searchType);
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                message: '查询成功',
                data: result.recordset
            });
        } else {
            return res.json({ success: false, message: '查询失败' });
        }
    } catch (err) {
        console.error('查询失败:', err);
        return res.status(500).json({ success: false, message: '查询失败' });
    }
})
//发货
app.post('/updateUser', async (req, res) => {
    const { updateType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(updateType);
        // 检查是否插入成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '更新成功'
            });
        } else {
            return res.json({ success: false, message: '更新失败' });
        }
    } catch (err) {
        console.error('更新失败:', err);
        return res.status(500).json({ success: false, message: '更新失败' });
    }
});
//发货
app.post('/updateUserOrder', async (req, res) => {
    const { updateType } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(updateType);
        // 检查是否更新成功
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: '更新成功'

            });
        } else {
            return res.json({ success: false, message: '更新失败' });
        }
    } catch (err) {
        console.error('更新失败:', err);
        return res.status(500).json({ success: false, message: '更新失败' });
    }
});
// 发送订单邮件的函数
function sendOrderEmail(recipientEmail, sendEmailType) {
    let mailOptions = {
        from: '2291417732@qq.com',  // 发送者邮箱
        to: recipientEmail,         // 接收者邮箱
        subject: '订单发货通知',        // 邮件标题
        text: sendEmailType, // 邮件内容
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('订单消息邮件发送失败：', error)
        }
        console.log('订单消息邮件已发送: ' + `${recipientEmail}` + info.response)
    });
}
//-----------------------------------------------------------------

//管理员发货发送邮件
app.post('/sendOrderToemail', (req, res) => {
    const { email, sendEmailType } = req.body
    // 发送邮件到用户邮箱
    sendOrderEmail(email, sendEmailType)
    res.json({ success: true });
});
app.listen(80, () => {
    console.log('服务器正在运行:http://8.138.28.35/');
});
