//----------------------用户注册-----------------------------
// 验证昵称非空
function nameInput() {
    const name = document.querySelector('.inputname').value;
    const nameError = document.querySelector('.nameError');
    if (name.trim() === "") {
        nameError.textContent = '昵称不能为空';
    } else {
        nameError.textContent = '';
    }
}
// 验证邮箱格式
function EmailInput() {
    const email = document.querySelector('.inputemail').value;
    const emailError = document.querySelector('.emailError');
    const emailRegex = /^[1-9][0-9]{4,10}@qq\.com$/;
    if (!emailRegex.test(email)) {
        emailError.textContent = '请输入正确的邮箱';
    } else {
        emailError.textContent = '';
    }
}
// 验证密码长度
function PasswordInput() {
    const password = document.querySelector('.inputpwd').value;
    const passwordError = document.querySelector('.passwordError');
    ConfirmPasswordInput()
    if (password.length < 6 || password.length > 18) {
        passwordError.textContent = '密码应在6-18位';
    } else {
        passwordError.textContent = '';
    }
}
// 验证确认密码是否一致
function ConfirmPasswordInput() {
    const password = document.querySelector('.inputpwd').value;
    const confirmPassword = document.querySelector('.inputpwd.again').value;
    const confirmPasswordError = document.querySelector(".confirmPasswordError");
    if (confirmPassword !== password) {
        confirmPasswordError.textContent = '请输入相同的密码';
    } else {
        confirmPasswordError.textContent = '';
    }
}
//验证码是否正确
let randomCode = 0
function CodeInput(Code) {
    const code = document.querySelector('.inputcode').value;
    const codeError = document.querySelector('.codeError');

    if (code != Code || !code) {
        codeError.textContent = '验证码错误';
        return true
    } else {
        codeError.textContent = '';
    }
}
// 发送验证码前验证邮箱是否合理
function Email(email) {
    const emailRegex = /^[1-9][0-9]{4,10}@qq\.com$/;

    if (!emailRegex.test(email)) {
        return false
    }
    else { return true }
}
//点击发送验证码
function sendCode(button) {
    //验证邮箱是否正确
    EmailInput();
    //验证邮箱是否已被使用
    isEmailUsed().then(EmailUsed => {
        if (EmailUsed) {
            const emailError = document.querySelector('.emailError')
            emailError.textContent = "该邮箱已被使用"
        }
        else {
            PasswordInput();
            ConfirmPasswordInput();
            nameInput();
            const emailError = document.querySelector('.emailError').textContent;
            const passwordError = document.querySelector('.passwordError').textContent;
            const confirmPasswordError = document.querySelector('.confirmPasswordError').textContent;
            const nameError = document.querySelector('.nameError').textContent;
            // 没错就发验证码
            if (!emailError && !passwordError && !confirmPasswordError && !nameError) {
                const email = document.querySelector('.inputemail').value;
                let clicktime = 1
                button.disabled = true
                button.innerHTML = `${clicktime}后可再次发送验证码`
                let clicktimeinterval = setInterval(function () {
                    clicktime--
                    button.innerHTML = `${clicktime}s后可再次<br>发送验证码`
                    if (clicktime <= 0) {
                        clearInterval(clicktimeinterval)
                        button.disabled = false
                        button.innerHTML = `发送验证码`
                    }
                }, 1000)
                fetch('/sendcode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            randomCode = data.Code
                            alert("验证码已发送到您的邮箱！");
                            console.log(randomCode)
                        } else {
                            alert("发送验证码失败，请稍后再试！");
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        alert("发送验证码失败，请稍后再试！");
                    });
            } else {

            }

        }

    })
}
//点击发送验证码时验证邮箱是否已被使用
async function isEmailUsed() {
    const email = document.querySelector('.inputemail').value;
    try {
        const response = await fetch('/isEmailUsed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchType: `Select *from useraccount where email='${email}'`,
            })
        });
        const res = await response.json();
        if (res.success) {
            // 该邮箱已被使用
            return true;
        } else {
            // 该邮箱未被使用
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}
//提交表单后信息无误后将该用户信息插入到数据库
function insertUseraccountToDataBase() {
    const email = document.querySelector('.inputemail').value;
    const password = document.querySelector('.inputpwd.again').value;
    const name = document.querySelector('.inputname').value;
    fetch('/Userregister', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            insertType: `INSERT INTO useraccount (email, pwd, umoney, uname) VALUES ('${email}', '${password}', 100000, '${name}')`,
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                // 登录成功，跳转到登录页
                alert("注册成功！返回登录页面");
                createUserPaycart()
            }
            else {
                // 登录失败，显示错误信息
                alert("注册失败！")
            }
        })
}
//提交表单后根据邮箱创建一个该用户的购物车表
function createUserPaycart() {
    const email = document.querySelector('.inputemail').value;
    fetch('/createUserPaycart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Emailtext: email,
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                createUserOrder()
            }
        })
}
//提交表单后根据邮箱创建一个该用户的历史订单表
function createUserOrder() {
    const email = document.querySelector('.inputemail').value;
    fetch('/createUserOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Emailtext: email,
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                window.location.replace('http://localhost/login.html');
            }
        })
}
function submitForm(event) {
    event.preventDefault();
    EmailInput();
    PasswordInput();
    ConfirmPasswordInput();
    nameInput();
    CodeInput(randomCode);
    const emailError = document.querySelector('.emailError').textContent;
    const passwordError = document.querySelector('.passwordError').textContent;
    const confirmPasswordError = document.querySelector('.confirmPasswordError').textContent;
    const nameError = document.querySelector('.nameError').textContent;
    const codeError = document.querySelector('.codeError').textContent;
    if (!emailError && !passwordError && !confirmPasswordError && !nameError && !codeError) {
        isEmailUsed().then(EmailUsed => {
            if (EmailUsed) {
                const emailError = document.querySelector('.emailError')
                emailError.textContent = "该邮箱已被使用"
            }
            else {
                insertUseraccountToDataBase()
            }
        })
    }
}
//----------------------用户登录-----------------------------
//返回当前登录人员
function checkWhologin() {
    let getwhologinsessionStorage = sessionStorage.getItem('whologin')
    if (getwhologinsessionStorage) {
        let whologinsessionStorage = JSON.parse(getwhologinsessionStorage)
        if (whologinsessionStorage.who == 'nobody') {
            let whologin = {
                who: 'nobody',
                name: '',
                money: 0,
                Emailtext: ''
            }
            return whologin
        }
        else if (whologinsessionStorage.who == 'user') {
            let getwhologinlocalStorage = localStorage.getItem(`${whologinsessionStorage.Emailtext}`)
            let whologinlocalStorage = JSON.parse(getwhologinlocalStorage)
            return whologinlocalStorage
        }
        else if (whologinsessionStorage.who == 'manager') {
            let getwhologinlocalStorage = localStorage.getItem(`manager_${whologinsessionStorage.Emailtext}`)
            let whologinlocalStorage = JSON.parse(getwhologinlocalStorage)
            return whologinlocalStorage
        }
    }
    else {
        let whologin = {
            who: 'nobody',
            name: '',
            money: 0,
            Emailtext: ''
        }
        return whologin
    }
}
//用户登录
function userlogin(event) {
    event.preventDefault();
    const Email = document.querySelector('.inputemail').value
    const pwd = document.querySelector('.inputpwd').value
    fetch('/Userlogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Email: Email,
            searchType: `SELECT * FROM useraccount WHERE email ='${Email}' AND pwd = '${pwd}'`
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                let whologin =
                {
                    who: 'nobody',
                    name: '',
                    money: 0,
                    Emailtext: ''
                }
                whologin.who = 'user'
                whologin.name = res.data.uname
                whologin.money = res.data.umoney.toFixed(2)
                whologin.Emailtext = res.data.email
                sessionStorage.setItem('whologin', JSON.stringify(whologin))
                localStorage.setItem(`${whologin.Emailtext}`, JSON.stringify(whologin))
                let User = {
                    name: whologin.name,
                    Emailtext: whologin.Emailtext
                }
                let Userpaycart = new URLSearchParams(User).toString()
                window.location.replace(`http://localhost?${Userpaycart}`);
            } else {
                document.querySelector('.error').innerText = `${res.message}`;
            }
        })
        .catch(error => {
            console.error('登录请求失败:', error);
            document.querySelector('.error').innerText = `${res.message}`;
        });
}
//管理员登陆
function managerlogin(event) {
    event.preventDefault();
    const Email = document.querySelector('.inputemail').value
    const pwd = document.querySelector('.inputpwd').value
    fetch('/Managerlogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Email: Email,
            searchType: `SELECT * FROM manager WHERE email ='${Email}' AND pwd = '${pwd}'`
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                let whologin =
                {
                    who: 'nobody',
                    name: '',
                    money: 0,
                    Emailtext: ''
                }
                whologin.who = 'manager'
                whologin.name = res.data.uname
                whologin.Emailtext = res.data.email
                sessionStorage.setItem('whologin', JSON.stringify(whologin))
                localStorage.setItem(`manager_${whologin.Emailtext}`, JSON.stringify(whologin))
                let manager = {
                    who: whologin.who,
                    name: whologin.name,
                    Emailtext: whologin.Emailtext
                }
                let managerMessage = new URLSearchParams(manager).toString()
                window.location.replace(`http://localhost?${managerMessage}`);
            } else {
                document.querySelector('.error').innerText = '邮箱或者密码错误';
            }
        })
        .catch(error => {
            console.error('登录请求失败:', error);
            document.querySelector('.error').innerText = '登录繁忙，请稍后再试';
        });

}
//退出登录
function logout() {
    let whologin = sessionStorage.getItem('whologin')
    let getwhologin = JSON.parse(whologin)
    getwhologin.who = 'nobody'
    getwhologin.name = ''
    getwhologin.money = 0
    getwhologin.Emailtext = ''
    sessionStorage.setItem('whologin', JSON.stringify(getwhologin))
    window.location.replace('http://localhost')
}
//禁止刷新
function banrefresh() {
    const lastRefresh = sessionStorage.getItem('lastRefresh');
    const currentTime = Date.now();
    // 检查是否在3秒内刷新
    if (lastRefresh && currentTime - lastRefresh < 3000) {
        alert("3秒内无法重复此操作");
        return;
    }
    // 更新刷新时间
    sessionStorage.setItem('lastRefresh', currentTime);
}
//禁止退出登录
function banlogout() {
    //退出登录
    const getlogout = document.querySelector('.logout')
    getlogout.addEventListener('click', function () {
        const lastRefresh = sessionStorage.getItem('lastRefresh');
        const currentTime = Date.now();
        if (lastRefresh && currentTime - lastRefresh < 5000) {
            alert("5秒内无法退出登录！");
        }
        else if (confirm("您确定退出登录吗")) { logout() }
    })
}
//----------------------主页展示商品--------------------------------
//读取并且展示商品
async function showProduct() {
    try {
        const response = await fetch('/products');
        const data = await response.json();
        for (let i = 0; i <= 5; i++) {
            const productbox = document.querySelector('.productbox')
            const pro = document.createElement('div')
            pro.classList.add('product')
            pro.setAttribute('id', `${data[i].id}`)
            if (data[i].pname == '该商品已下架') {
                pro.innerHTML = `
                     <a href="${data[i].img_url}" target="_blank"><img src="${data[i].img_url}" alt="${data[i].pname}" class="proImg"></a>
                     <div> <span class="proName">${data[i].pname}</span></div>
                     <div style="visibility: hidden">价格：<span class="proPrice">${data[i].price}</span></div>
                     <button class="addcart" style="visibility: hidden"></button>
                  `;
            }
            else {
                pro.innerHTML = `
                     <a href="${data[i].img_url}" target="_blank"><img src="${data[i].img_url}" alt="${data[i].pname}" class="proImg"></a>
                     <div> <span class="proName">${data[i].pname}</span></div>
                     <div>价格：<span class="proPrice">${data[i].price}</span></div>
                     <button class="addcart">加入购物车</button>
                  `;
            }
            productbox.appendChild(pro)
        }
    } catch (error) {
        console.error('获取产品数据失败:', error);
    }
}
//----------------------展示对应的导航栏------------------------
//未登录时的导航栏
function nobodynav() {
    const nav = document.querySelector('.nav')
    const navlogin = document.createElement('a');
    navlogin.classList.add('login')
    navlogin.href = 'login.html';
    navlogin.innerHTML = '登录'
    const navregister = document.createElement('a');
    navregister.classList.add('freeregister')
    navregister.href = 'register.html';
    navregister.innerHTML = '免费注册'
    const navpaycar = document.createElement('button');
    navpaycar.classList.add('cart')
    navpaycar.innerHTML = '<img src="./images/cart.jpg"> 购物车'
    const navorder = document.createElement('button')
    navorder.classList.add('order')
    navorder.innerHTML = '历史订单'
    nav.appendChild(navlogin)
    nav.appendChild(navregister)
    nav.appendChild(navorder)
    nav.appendChild(navpaycar)
}
//用户导航栏
function usernav(whologin) {
    localStorage.removeItem(`cart_${whologin.Emailtext}`)
    localStorage.removeItem(`initcart_${whologin.Emailtext}`)
    localStorage.removeItem(`order_${whologin.Emailtext}`)
    const nav = document.querySelector('.nav')
    const navUserName = document.createElement('span');
    navUserName.classList.add('username')
    navUserName.innerHTML = '用户名：' + whologin.name
    const navUserMoney = document.createElement('span')
    navUserMoney.classList.add('usermoney')
    navUserMoney.innerHTML = '余额：' + whologin.money
    const navpaycar = document.createElement('button');
    navpaycar.classList.add('cart')
    navpaycar.innerHTML = '<img src="./images/cart.jpg"> 购物车'
    const navorder = document.createElement('button')
    navorder.classList.add('order')
    navorder.innerHTML = '历史订单'
    const navlogout = document.createElement('button')
    navlogout.classList.add('logout')
    navlogout.innerHTML = '退出登录'

    nav.appendChild(navUserName)
    nav.appendChild(navUserMoney)
    nav.appendChild(navlogout)
    nav.appendChild(navorder)
    nav.appendChild(navpaycar)

}
//管理员导航栏
function Mnav(whologin) {
    localStorage.removeItem('managerGetuserOrder');
    const nav = document.querySelector('.nav')
    const navUserName = document.createElement('span');
    navUserName.classList.add('username')
    navUserName.innerHTML = '管理员：' + whologin.name
    const navUserMoney = document.createElement('span')
    navUserMoney.classList.add('usermoney')
    const updateproduct = document.createElement('button')
    updateproduct.classList.add('updatepro')
    updateproduct.innerHTML = '点击此处更新商品'
    const updateuser = document.createElement('button')
    updateuser.classList.add('updateuser')
    updateuser.innerHTML = '点击此处更新用户'
    const navlogout = document.createElement('button')
    navlogout.classList.add('logout')
    navlogout.innerHTML = '退出登录'
    nav.appendChild(navUserName)
    nav.appendChild(updateproduct)
    nav.appendChild(updateuser)
    nav.appendChild(navlogout)
}
//---------------当未登录时让所有的按钮都提示登录----------
function banbutton() {
    const getall = document.querySelectorAll('button')
    getall.forEach(button => {
        button.addEventListener('click', function () {
            alert('请先登录')
        })
    })
}
//----------------------购物车--------------------------------
//主页用户点击购物车链接
function Gocart(whologin) {
    const cart = document.querySelector('.cart')
    cart.addEventListener('click', function () {
        const getUsermessageINlocal = localStorage.getItem(`${whologin.Emailtext}`)
        let UsermessageINlocal = JSON.parse(getUsermessageINlocal)
        let User = {
            name: UsermessageINlocal.name,
            Emailtext: UsermessageINlocal.Emailtext,
        }
        let Userpaycart = new URLSearchParams(User).toString()
        window.open(`http://localhost/cart.html?${Userpaycart}`, '_blank');

    })
}
//从本地读取用户购物车
function getUsercart(whologin) {
    let getUsercart = localStorage.getItem(`cart_${whologin.Emailtext}`)
    if (getUsercart) {
        let Usercart = JSON.parse(getUsercart)
        return Usercart
    }
    else {
        let Usercart = {
            Emailtext: whologin.Emailtext,
            ID: [],
            pname: [],
            price: [],
            img_url: [],
            count: [],
        }
        return Usercart
    }
}
//从本地读取用户初始购物车，用作更新购物车
function getUserinitcart(whologin) {
    let getUsercart = localStorage.getItem(`initcart_${whologin.Emailtext}`)
    if (getUsercart) {
        let Usercart = JSON.parse(getUsercart)
        return Usercart
    }
    else {
        let Usercart = {
            Emailtext: whologin.Emailtext,
            ID: [],
            pname: [],
            price: [],
            img_url: [],
            count: [],
        }
        return Usercart
    }
}
//从数据库读取购物车
function Usercartdatabase(whologin) {
    fetch('/searchCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userEmail: whologin.Emailtext
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                let Usercart = getUsercart(whologin)
                for (let i = 0; i < res.cart.length; i++) {
                    Usercart.ID[i] = res.cart[i].id
                    Usercart.pname[i] = res.cart[i].pname
                    Usercart.price[i] = res.cart[i].price
                    Usercart.img_url[i] = res.cart[i].img_url
                    Usercart.count[i] = res.cart[i].count
                    localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                    localStorage.setItem(`initcart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                }
            }
            //检查更新
            productifupdate(whologin)
            Userorderdatabase(whologin)
        })
}
//切换页面更新余额
function updatemoney() {
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            let whologin = checkWhologin()
            const getusermoney = document.querySelector('.usermoney')
            getusermoney.textContent = `余额：${whologin.money}`
        }
    });
}
//主页以及购物车页面刷新后从本地存储读取用户购物车然后插入到数据库里
function updatePaycart(whologin) {
    let Usercart = getUsercart(whologin);
    let Userinitcart = getUserinitcart(whologin);
    let updateType = ``;
    // 先查询初始购物车是否已有商品不在当前购物车
    for (let i = 0; i < Userinitcart.ID.length; i++) {
        let found = false; // 标记商品是否在当前购物车中
        for (let j = 0; j < Usercart.ID.length; j++) {
            if (Userinitcart.ID[i] === Usercart.ID[j]) {
                found = true; // 找到商品，跳出内层循环
                break;
            }
        }
        if (!found) {
            // 商品不在当前购物车中，添加删除语句
            updateType += `DELETE FROM [cart_${Usercart.Emailtext}] WHERE id='${Userinitcart.ID[i]}';\n`;
        }
    }
    // 查询当前购物车中商品的更新和插入
    for (let i = 0; i < Usercart.ID.length; i++) {
        let foundInInit = false; // 标记商品是否在初始购物车中
        for (let j = 0; j < Userinitcart.ID.length; j++) {
            if (Usercart.ID[i] === Userinitcart.ID[j]) {
                foundInInit = true; // 商品在初始购物车中，执行更新
                updateType += `UPDATE [cart_${Usercart.Emailtext}] SET pname='${Usercart.pname[i]}', price=${Usercart.price[i]}, img_url='${Usercart.img_url[i]}', count=${Usercart.count[i]} WHERE id='${Usercart.ID[i]}';\n`;
                break;
            }
        }
        if (!foundInInit) {
            // 商品不在初始购物车中，执行插入
            updateType += `INSERT INTO [cart_${Usercart.Emailtext}] (id, pname, price, img_url, count) VALUES ('${Usercart.ID[i]}', '${Usercart.pname[i]}', ${Usercart.price[i]}, '${Usercart.img_url[i]}', ${Usercart.count[i]});\n`;
        }
    }
    //更新之后将初始购物车同步
    localStorage.setItem(`initcart_${whologin.Emailtext}`, JSON.stringify(Usercart))
    if (updateType) {
        // 发送请求到服务器进行更新
        fetch('/updatecart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ updateType: updateType })
        })
            .then(response => response.json())
            .then(res => {
                if (res.success) {
                    // 更新成功后的处理逻辑
                } else {
                    alert(res.message);
                }
            })
            .catch(err => {
                console.error('请求失败:', err);
            });
    }
}
//用户点击返回主页
function GoIndex(whologin) {
    const getbacktoindexbutton = document.querySelector('.backindex')
    getbacktoindexbutton.addEventListener('click', function () {
        const getUsermessageINlocal = localStorage.getItem(`${whologin.Emailtext}`)
        let UsermessageINlocal = JSON.parse(getUsermessageINlocal)
        let User = {
            name: UsermessageINlocal.name,
            Emailtext: UsermessageINlocal.Emailtext,
        }
        let Userpaycart = new URLSearchParams(User).toString()
        window.location.href = `http://localhost/?${Userpaycart}`
    })
}
//购物车页面用户的个人购物车展示
function showcart(whologin) {
    let Usercart = getUsercart(whologin)
    const usermoney = document.querySelector('.usermoney')
    usermoney.textContent = `余额：${whologin.money}`
    const cartbody = document.querySelector('.cartbody')
    for (let i = 0; i < Usercart.ID.length; i++) {
        const product = document.createElement('div')
        product.classList.add('product')
        product.setAttribute('id', `${Usercart.ID[i]}`)
        cartbody.appendChild(product)
        let countMoney = Usercart.count[i] * Usercart.price[i]
        product.innerHTML = ` 
                <div class="select"><input type="checkbox"></div>
                <div class="proImg"><img src="${Usercart.img_url[i]}" alt="?"></div>
                <div class="proName">${Usercart.pname[i]}</div>
                <div class="proPrice">${Usercart.price[i]}</div>
                <div class="add-reduce">
                <div class="reduce"><img src="./images/reduce.jpg" width="17px"></div>
                <div class="proCount">${Usercart.count[i]}</div>
                <div class="add"><img src="./images/add.jpg" width="17px"></div>
                </div>
                <div class="countMoney">${countMoney}</div>
                <div class="delete"><span>删除</span></div>`
    }
}
//购物车页面从url读取用户信息然后读取本地存储
function cartgetUser() {
    let urlParams = new URLSearchParams(window.location.search)
    let User = {
        name: urlParams.get('name'),
        Emailtext: urlParams.get('Emailtext'),
    }
    const UserInlocal = JSON.parse(localStorage.getItem(`${User.Emailtext}`))
    return UserInlocal
}
//主页添加购物车
function ADDcart(whologin) {
    const getall = document.querySelector('body')
    const getaddcart = getall.querySelectorAll('.addcart')
    getaddcart.forEach(button => {
        button.addEventListener('click', function () {
            const product = button.closest('.product')
            //获取该商品的信息
            const productID = product.getAttribute('id')
            const proName = product.querySelector('.proName')
            const proPrice = product.querySelector('.proPrice')
            const proimgurl = product.querySelector('img')
            let Usercart = getUsercart(whologin)
            //如果购物车没有商品，则添加第一个商品
            if (!Usercart.ID.length) {
                Usercart.Emailtext = whologin.Emailtext
                Usercart.ID[0] = productID
                Usercart.pname[0] = proName.textContent
                Usercart.price[0] = proPrice.textContent
                Usercart.img_url[0] = proimgurl.src
                Usercart.count[0] = 1
                localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                alert('该商品已成功加入购物车')
            }
            //购物车如果有商品则遍历所有商品看是否有该商品
            else {
                for (let i = 0; i < Usercart.ID.length; i++) {
                    //如果有该商品则修改其数量以及购物车总数
                    if (Usercart.ID[i] == productID) {
                        alert('该商品已在购物车')
                        break
                    }
                    //如果遍历完所有商品发现没有该商品，在添加该商品到购物车
                    if (i == Usercart.ID.length - 1 && Usercart.ID[i] != productID) {
                        Usercart.ID[i + 1] = productID
                        Usercart.pname[i + 1] = proName.textContent
                        Usercart.price[i + 1] = proPrice.textContent
                        Usercart.img_url[i + 1] = proimgurl.src
                        Usercart.count[i + 1] = 1
                        localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                        alert('该商品已成功加入购物车')
                        break
                    }
                }
            }
        })
    })

}
//购物车页面添加商品数量
function ADDproduct(whologin) {
    const getall = document.querySelector('body')
    const getaddproduct = getall.querySelectorAll('.add')
    getaddproduct.forEach(Element => {
        Element.addEventListener('click', function () {
            //获取该商品的父容器
            const product = Element.closest('.product')
            const reduceproduct = product.querySelector('.reduce')
            reduceproduct.style.cursor = ''; // 恢复默认光标样式
            reduceproduct.style.pointerEvents = ''; // 恢复鼠标事件
            //获取该商品的信息
            const productID = product.getAttribute('id')
            const proPrice = product.querySelector('.proPrice')
            //获取该商品在购物车的数量
            const procount = product.querySelector('.proCount')
            const countMoney = product.querySelector('.countMoney')
            //更新当前商品的加入次数
            let nowcount = parseInt(procount.textContent)
            if (nowcount < 10) {
                procount.textContent = nowcount + 1
                countMoney.textContent = parseInt(procount.textContent) * parseFloat(proPrice.textContent)
                let Usercart = getUsercart(whologin)
                for (let i = 0; i < Usercart.ID.length; i++) {
                    if (Usercart.ID[i] == productID) {
                        Usercart.count[i] = parseInt(procount.textContent)
                        localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                        break
                    }
                }
                //获取该商品的单选框,在增加时判断该商品是否已被选中,选中还要修改total
                const select = product.querySelector('.select input')
                if (select.checked) {
                    const getselectcount = getall.querySelector('#selectcount')
                    const gettotalmoney = getall.querySelector('#totalmoney')
                    getselectcount.textContent = parseInt(getselectcount.textContent) + 1
                    gettotalmoney.textContent = (parseFloat(gettotalmoney.textContent) + parseFloat(proPrice.textContent)).toFixed(2)
                    if (parseFloat(gettotalmoney.textContent) > parseFloat(whologin.money)) {
                        gettotalmoney.style.color = 'red';
                    }
                    else {
                        gettotalmoney.style.color = 'black';
                    }
                }
            }
            else {
                alert('每件商品最多加入10件加入购物车')
            }
        })
    })

}
//主页以及购物车页面移出购物车
function Reduceproduct(whologin) {
    const getall = document.querySelector('body')
    const getreduceproduct = getall.querySelectorAll('.reduce')
    getreduceproduct.forEach(Element => {
        const product = Element.closest('.product')
        const procount = product.querySelector('.proCount')
        let nowcount = parseInt(procount.textContent)
        if (nowcount == 1) {
            Element.style.cursor = 'not-allowed'; // 设置光标样式
        }
        Element.addEventListener('click', function () {
            const product = Element.closest('.product')
            const procount = product.querySelector('.proCount')
            let nowcount = parseInt(procount.textContent)
            //获取该商品的信息
            const productID = product.getAttribute('id')
            const countMoney = product.querySelector('.countMoney')
            const proPrice = product.querySelector('.proPrice')
            let Usercart = getUsercart(whologin)
            if (nowcount == 2) {
                Element.style.cursor = 'not-allowed'; // 设置光标样式
                procount.textContent = nowcount - 1
                countMoney.textContent = parseInt(procount.textContent) * parseFloat(proPrice.textContent)
                //遍历所有商品修改其数量
                for (let i = 0; i < Usercart.ID.length; i++) {
                    if (Usercart.ID[i] == productID) {
                        Usercart.count[i] = parseInt(procount.textContent)
                        localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                        break
                    }
                }
                const select = product.querySelector('.select input')
                if (select.checked) {
                    const getselectcount = getall.querySelector('#selectcount')
                    const gettotalmoney = getall.querySelector('#totalmoney')
                    getselectcount.textContent = parseInt(getselectcount.textContent) - 1
                    gettotalmoney.textContent = (parseFloat(gettotalmoney.textContent) - parseFloat(proPrice.textContent)).toFixed(2)
                    if (parseFloat(gettotalmoney.textContent) > parseFloat(whologin.money)) {
                        gettotalmoney.style.color = 'red';
                    }
                    else {
                        gettotalmoney.style.color = 'black';
                    }
                }
            }
            else if (nowcount >= 3) {
                procount.textContent = nowcount - 1
                countMoney.textContent = parseInt(procount.textContent) * parseFloat(proPrice.textContent)
                //遍历所有商品修改其数量
                for (let i = 0; i < Usercart.ID.length; i++) {
                    if (Usercart.ID[i] == productID) {
                        Usercart.count[i] = parseInt(procount.textContent)
                        localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                        break
                    }
                }
                //获取该商品的单选框,在增加时判断该商品是否已被选中,选中还要修改total
                const select = product.querySelector('.select input')
                if (select.checked) {
                    const getselectcount = getall.querySelector('#selectcount')
                    const gettotalmoney = getall.querySelector('#totalmoney')
                    getselectcount.textContent = parseInt(getselectcount.textContent) - 1
                    gettotalmoney.textContent = (parseFloat(gettotalmoney.textContent) - parseFloat(proPrice.textContent)).toFixed(2)
                    if (parseFloat(gettotalmoney.textContent) > parseFloat(whologin.money)) {
                        gettotalmoney.style.color = 'red';
                    }
                    else {
                        gettotalmoney.style.color = 'black';
                    }
                }
            }
        })
    })
}
//单选多选
function select(whologin) {
    let totalmoney = 0
    let totalcount = 0
    let usermoney = whologin.money
    const getall = document.querySelector('body')
    const select = getall.querySelectorAll('.select input')
    const selectall = getall.querySelector('.selectAll input')
    selectall.addEventListener('click', (event) => {
        if (event.target.checked) {
            // 全选复选框被选中时，选中所有复选框
            //读取当前结算栏的总计和总选
            const getselectcount = getall.querySelector('#selectcount')
            const gettotalmoney = getall.querySelector('#totalmoney')
            //重新赋值
            totalcount = parseInt(getselectcount.textContent)
            totalmoney = parseFloat(gettotalmoney.textContent)
            select.forEach((checkbox) => {
                //将没选中的商品加到总计
                if (!checkbox.checked) {
                    const product = checkbox.closest('.product')
                    const procount = product.querySelector('.proCount')
                    totalcount = totalcount + parseInt(procount.textContent)
                    const countMoney = product.querySelector('.countMoney')
                    totalmoney = (parseFloat(totalmoney) + parseFloat(countMoney.textContent)).toFixed(2)
                    getselectcount.textContent = `${totalcount}`
                    gettotalmoney.textContent = `${totalmoney}`
                }
                //全选之后如果余额不够则将总计变成红色
                if (parseFloat(gettotalmoney.textContent) > parseFloat(usermoney)) {
                    gettotalmoney.style.color = 'red';
                }
            })
            select.forEach(checkbox => checkbox.checked = true);
        } else {
            //取消全选
            const getselectcount = getall.querySelector('#selectcount')
            const gettotalmoney = getall.querySelector('#totalmoney')
            getselectcount.textContent = 0
            gettotalmoney.textContent = 0
            totalmoney = 0
            totalcount = 0
            select.forEach(checkbox => checkbox.checked = false);
            gettotalmoney.style.color = 'black';
        }
    })

    //这里是单选
    select.forEach((checkbox) => {
        checkbox.addEventListener('click', (event) => {
            //读取当前结算栏的总计和总选
            const getselectcount = getall.querySelector('#selectcount')
            const gettotalmoney = getall.querySelector('#totalmoney')
            totalmoney = parseFloat(gettotalmoney.textContent)
            totalcount = parseInt(getselectcount.textContent)
            // 在这里处理点击事件
            const allChecked = Array.from(select).every(checkbox => checkbox.checked);
            selectall.checked = allChecked; // 如果都被选中，则全选按钮选中，否则取消选中
            if (event.target.checked) {
                const product = checkbox.closest('.product')
                const procount = product.querySelector('.proCount')
                totalcount = totalcount + parseInt(procount.textContent)
                const countMoney = product.querySelector('.countMoney')
                totalmoney = (totalmoney + parseFloat(countMoney.textContent)).toFixed(2)
                getselectcount.textContent = `${totalcount}`
                gettotalmoney.textContent = `${totalmoney}`
                if (parseFloat(gettotalmoney.textContent) > parseFloat(usermoney)) {
                    gettotalmoney.style.color = 'red';
                }
            } else {
                const product = checkbox.closest('.product')
                const procount = product.querySelector('.proCount')
                totalcount = totalcount - parseInt(procount.textContent)
                const countMoney = product.querySelector('.countMoney')
                totalmoney = (totalmoney - parseFloat(countMoney.textContent)).toFixed(2)
                getselectcount.textContent = `${totalcount}`
                gettotalmoney.textContent = `${totalmoney}`
                if (parseFloat(gettotalmoney.textContent) <= parseFloat(usermoney)) {
                    gettotalmoney.style.color = 'black';
                }
            }
        });
    });
}
//购物车页面点击移除按钮
function deleteproduct(whologin) {
    let Usercart = getUsercart(whologin)
    const getall = document.querySelector('body')
    const getdelete = getall.querySelectorAll('.cartbox .delete span')
    getdelete.forEach(Element => {
        Element.addEventListener('click', function () {
            if (confirm('确定移除该商品？')) {
                //获取该商品的父容器
                const product = Element.closest('.product')
                //获取该商品的信息
                const productID = product.getAttribute('id')
                //将用户的本地存储的购物车删除对应的商品
                for (let i = 0; i <= Usercart.ID.length; i++) {
                    if (productID == Usercart.ID[i]) {
                        Usercart.ID.splice(i, 1)
                        Usercart.pname.splice(i, 1)
                        Usercart.img_url.splice(i, 1)
                        Usercart.count.splice(i, 1)
                        Usercart.price.splice(i, 1)
                        localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                        break
                    }
                }
                let User = {
                    name: whologin.name,
                    Emailtext: whologin.Emailtext,
                }
                let usercart = new URLSearchParams(User).toString()
                //删除完之后重新加载页面
                window.location.replace(`http://localhost/cart.html?${usercart}`);
            }
        })
    })
}
//购物车页面购买已选的商品
function checkoutproduct(whologin) {
    let Usercart = getUsercart(whologin)
    let Userorder = getUserorder(whologin)
    const getall = document.querySelector('body')
    let usermoney = whologin.money
    const select = getall.querySelectorAll('.select input')
    const pay = getall.querySelector('.buyfoot')
    pay.addEventListener('click', function () {
        const gettotalmoney = getall.querySelector('#totalmoney')
        const gettotalcount = getall.querySelector('#selectcount')
        if (parseInt(gettotalcount.textContent) == 0) {
            alert('未选择需要购买的商品')
        }
        else if (parseFloat(gettotalmoney.textContent) > parseFloat(usermoney)) {
            alert('余额不足')
        }
        else {
            if (confirm('确定购买已选商品？')) {
                let insertTypeUser = `insert into [order_${whologin.Emailtext}] values`
                let insertTypeManager = `insert into [managerOrder] values`
                select.forEach((checkbox) => {
                    //遍历所有的商品将已选上的商品挑出
                    if (checkbox.checked) {
                        //将购买的商品
                        //获取购物车的总数量
                        const product = checkbox.closest('.product')
                        const productID = product.getAttribute('id')
                        const proName = product.querySelector('.proName')
                        const proprice = product.querySelector('.proPrice')
                        const proimgurl = product.querySelector('img')
                        const procount = product.querySelector('.proCount')
                        let timestamp = Date.now()
                        let randomNum = Math.floor(Math.random() * 1000)
                        let orderId = `${timestamp}${randomNum}`
                        const today = new Date();
                        const ordertime = today.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
                        //将购买的商品信息插入到历史订单表
                        insertTypeUser = insertTypeUser + `('${orderId}', '${ordertime}', '${productID}', '${proName.textContent}', ${parseFloat(proprice.textContent)}, '${proimgurl.src}' , ${parseInt(procount.textContent)}, '未发货'),`
                        insertTypeManager = insertTypeManager + `('${orderId}', '${ordertime}', '${whologin.Emailtext}', '${productID}', '${proName.textContent}', ${parseFloat(proprice.textContent)}, '${proimgurl.src}' , ${parseInt(procount.textContent)},'未发货'),`
                        //将购买的商品信息插入到本地历史订单表
                        let j = Userorder.ID.length
                        Userorder.orderId[j] = orderId
                        Userorder.ordertime[j] = ordertime
                        Userorder.ID[j] = productID
                        Userorder.pname[j] = proName.textContent
                        Userorder.price[j] = parseFloat(proprice.textContent)
                        Userorder.img_url[j] = proimgurl.src
                        Userorder.count[j] = parseInt(procount.textContent)
                        Userorder.status[j] = '未发货'
                        localStorage.setItem(`order_${whologin.Emailtext}`, JSON.stringify(Userorder))
                        //将商品移除购物车
                        for (let i = 0; i < Usercart.ID.length; i++) {
                            if (productID == Usercart.ID[i]) {
                                Usercart.ID.splice(i, 1)
                                Usercart.pname.splice(i, 1)
                                Usercart.img_url.splice(i, 1)
                                Usercart.count.splice(i, 1)
                                Usercart.price.splice(i, 1)
                                localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                                break
                            }
                        }
                    }
                })
                if (insertTypeUser.endsWith(',')) {
                    insertTypeUser = insertTypeUser.slice(0, -1);
                }
                if (insertTypeManager.endsWith(',')) {
                    insertTypeManager = insertTypeManager.slice(0, -1);
                }
                insertTypeUser = insertTypeUser + ';' + insertTypeManager + ` ; update useraccount set umoney=${(parseFloat(usermoney) - parseFloat(gettotalmoney.textContent)).toFixed(2)} where email='${whologin.Emailtext}'`
                fetch('/insertOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        insertType: insertTypeUser,
                    })
                })
                    .then(response => response.json())
                    .then(res => {
                        if (res.success) {
                            alert(res.message)
                            //修改本地用户的余额 等上面插入完成之后更新用户的余额
                            whologin.money = (parseFloat(usermoney) - parseFloat(gettotalmoney.textContent)).toFixed(2)
                            localStorage.setItem(`${whologin.Emailtext}`, JSON.stringify(whologin))
                            let User = {
                                name: whologin.name,
                                Emailtext: whologin.Emailtext,
                            }
                            let usercart = new URLSearchParams(User).toString()
                            //重新加载购物车页面
                            window.location.replace(`http://localhost/cart.html?${usercart}`);
                        }
                        else {
                            alert(res.message)
                        }
                    })
            }
        }
    })
}
//商品更新则移出购物车
function productifupdate(whologin) {
    let productIsUpdate = ``
    let Usercart = getUsercart(whologin)
    const getall = document.querySelector('body')
    const product = getall.querySelectorAll('.product')
    product.forEach(Element => {
        const productID = Element.getAttribute('id')
        const proName = Element.querySelector('.proName')
        const proPrice = Element.querySelector('.proPrice')
        const proimgurl = Element.querySelector('img')
        for (let j = 0; j < Usercart.ID.length; j++) {
            if (productID == Usercart.ID[j]) {
                //商品信息有修改则移除购物车
                if (proName.textContent != Usercart.pname[j] || parseFloat(proPrice.textContent) != Usercart.price[j] || proimgurl.src != Usercart.img_url[j]) {
                    productIsUpdate = productIsUpdate + `${Usercart.pname[j]}、`
                    Usercart.ID.splice(j, 1)
                    Usercart.pname.splice(j, 1)
                    Usercart.img_url.splice(j, 1)
                    Usercart.count.splice(j, 1)
                    Usercart.price.splice(j, 1)
                    localStorage.setItem(`cart_${whologin.Emailtext}`, JSON.stringify(Usercart))
                    break
                }
                //商品信息无修改
                else {
                    break
                }
            }
        }
    })
    if (productIsUpdate.endsWith('、')) {
        productIsUpdate = productIsUpdate.slice(0, -1);
        alert(`由于商品更新，购物车中的失效商品：${productIsUpdate}被移除`)
    }
}
//----------------------历史订单---------------------------------
//主页用户点击去历史订单页面
function Goorder(whologin) {
    const getpayartbutton = document.querySelector('.order')
    getpayartbutton.addEventListener('click', function () {
        const getUsermessageINlocal = localStorage.getItem(`${whologin.Emailtext}`)
        let UsermessageINlocal = JSON.parse(getUsermessageINlocal)
        let User = {
            name: UsermessageINlocal.name,
            Emailtext: UsermessageINlocal.Emailtext,
        }
        let Userpaycart = new URLSearchParams(User).toString()
        window.open(`http://localhost/order.html?${Userpaycart}`, '_blank');
    })
}
//从本地读取用户历史订单
function getUserorder(whologin) {
    let getUserorder = localStorage.getItem(`order_${whologin.Emailtext}`)
    if (getUserorder) {
        let Userorder = JSON.parse(getUserorder)
        return Userorder
    }
    else {
        let Userorder = {
            Emailtext: whologin.Emailtext,
            orderId: [],
            ordertime: [],
            ID: [],
            pname: [],
            price: [],
            img_url: [],
            count: [],
            status: []
        }
        return Userorder
    }

}
//主页从数据库读取用户历史订单然后存到本地存储
function Userorderdatabase(whologin) {
    fetch('/searchOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userEmail: whologin.Emailtext
        })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                let Userorder = getUserorder(whologin)
                for (let i = 0; i < res.order.length; i++) {
                    Userorder.orderId[i] = res.order[i].orderId
                    Userorder.ordertime[i] = res.order[i].ordertime
                    Userorder.ID[i] = res.order[i].id
                    Userorder.pname[i] = res.order[i].pname
                    Userorder.price[i] = res.order[i].price
                    Userorder.img_url[i] = res.order[i].img_url
                    Userorder.count[i] = res.order[i].count
                    Userorder.status[i] = res.order[i].status
                    localStorage.setItem(`order_${whologin.Emailtext}`, JSON.stringify(Userorder))
                }
            }
        })
}
//历史订单页面从url读取用户信息然后读取本地存储
function ordergetUser() {
    let urlParams = new URLSearchParams(window.location.search)
    let User = {
        name: urlParams.get('name'),
        Emailtext: urlParams.get('Emailtext'),
    }
    const UserInlocal = JSON.parse(localStorage.getItem(`${User.Emailtext}`))
    return UserInlocal
}
//历史订单页面用户的个人历史订单展示
function showUserorder(whologin) {
    let Userorder = getUserorder(whologin)
    const orderbody = document.querySelector('.orderbody')
    for (let i = 0; i < Userorder.ID.length; i++) {
        const product = document.createElement('div')
        product.classList.add('product')
        //给父标签添加ID
        product.setAttribute('id', `${Userorder.orderId[i]}`)
        orderbody.appendChild(product)
        const countMoney = Userorder.price[i] * Userorder.count[i]
        product.innerHTML = ` 
            <div class="time">
                <div class="buytime">${Userorder.ordertime[i]}</div>
                <div class="buynumber">${Userorder.orderId[i]}</div>
            </div>
            <div class="proImg"><img src="${Userorder.img_url[i]}" alt="?"></div>
            <div class="proPame">${Userorder.pname[i]}</div>
            <div class="proPrice">${Userorder.price[i]}</div>
            <div class="add-reduce">
                <div class="proCountOrder">${Userorder.count[i]}</div>
            </div>
            <div class="countMoney">${countMoney}</div>
            <div class="status">${Userorder.status[i]}</div>
            <div class="delete"><span>删除</span></div>`
    }

}
//历史订单页面点击删除按钮
function deleteorder(whologin) {
    let Userorder = getUserorder(whologin)
    const getall = document.querySelector('body')
    const getdelete = getall.querySelectorAll('.delete')
    getdelete.forEach(button => {
        button.addEventListener('click', function () {
            //获取该商品的父容器
            const product = button.closest('.product')
            const orderbody = product.parentNode
            //获取该商品的信息
            const orderID = product.getAttribute('id')
            //获取该商品的状态
            const productStatus = product.querySelector('.status')
            if (productStatus.textContent == '未发货') {
                alert('该商品未发货，无法删除')
            }
            if (productStatus.textContent == '已发货') {
                if (confirm('确定移除该商品？')) {
                    //将用户的本地存储的购物车删除对应的商品
                    for (let i = 0; i <= Userorder.orderId.length; i++) {
                        if (orderID == Userorder.orderId[i]) {
                            Userorder.orderId.splice(i, 1)
                            Userorder.ordertime.splice(i, 1)
                            Userorder.ID.splice(i, 1)
                            Userorder.pname.splice(i, 1)
                            Userorder.img_url.splice(i, 1)
                            Userorder.count.splice(i, 1)
                            Userorder.price.splice(i, 1)
                            Userorder.status.splice(i, 1)
                            localStorage.setItem(`order_${whologin.Emailtext}`, JSON.stringify(Userorder))
                            break
                        }
                    }
                    //更新数据库
                    deleteType = `delete from [order_${whologin.Emailtext}] where orderID='${orderID}'`
                    fetch('/deleteOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            Email: whologin.Emailtext,
                            orderID: orderID,
                            deleteType: deleteType
                        })
                    })
                        .then(response => response.json())
                        .then(res => {
                            if (res.success) {
                                orderbody.removeChild(product)
                            }
                            else {
                                alert(res.message)
                            }
                        })
                }
            }
        })
    })
}
//--------------------管理员--------------------------
//修改商品列表的显示
function Mprobox() {
    const getall = document.querySelector('body')
    const addcarts = getall.querySelectorAll('.addcart')
    //将加入的位置更改为修改按钮
    addcarts.forEach(Element => {
        //添加一个上传图片的input但是不显示出来
        const product = Element.closest('.product')
        const proPrice = product.querySelector('.proPrice')
        const proPriceDad = proPrice.parentNode
        proPriceDad.style.visibility = 'visible'
        const imgupload = document.createElement('input')
        imgupload.type = "file"
        imgupload.accept = "image/*"
        imgupload.style = "display:none;"
        imgupload.classList.add('imgupload')
        product.appendChild(imgupload)
        //添加一个上传图片的按钮，与上面那个input联动
        const imgpro = document.createElement('button')
        imgpro.textContent = '上传图片'
        imgpro.classList.add('imguploadbutton')
        //添加编辑按钮
        const editpro = document.createElement('button')
        editpro.textContent = '编辑'
        editpro.classList.add('editpro')
        //添加删除按钮
        const deletepro = document.createElement('button')
        deletepro.textContent = '下架'
        deletepro.classList.add('removepro')
        const proupdate = document.createElement('p');
        proupdate.classList.add('proupdate')
        proupdate.appendChild(imgpro);
        proupdate.appendChild(editpro);
        proupdate.appendChild(deletepro);
        Element.replaceWith(proupdate)
    })
}
//上传图片并且保存在images文件夹
function Muploadproimg() {
    const imguploadbutton = document.querySelectorAll('.imguploadbutton');
    imguploadbutton.forEach(button => {
        button.addEventListener('click', function () {
            const product = button.closest('.product');
            const img = product.querySelector('.imgupload');
            img.click();
            img.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const newimg = new FormData();
                    newimg.append('image', file);
                    // 将图片通过 POST 请求发送到服务器
                    fetch('/uploadimg', {
                        method: 'POST',
                        body: newimg
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // 更新商品图片的 src，使用服务器返回的图片路径
                                product.querySelector('.proImg').src = data.filePath;
                                product.querySelector('a').href = data.filePath
                                const proName = product.querySelector('.proName')
                                if (proName.textContent == '此处商品已下架') {
                                    proName.textContent = '请修改商品名'
                                }
                            } else {
                                alert('图片上传失败');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            }, { once: true }); // 确保事件只执行一次
        });
    });
}
//编辑当前按钮
function Meditpro() {
    const getall = document.querySelector('body')
    const editpro = getall.querySelectorAll('.editpro')
    editpro.forEach(button => {
        button.dataset.isEditing = 'false';
        button.addEventListener('click', function () {
            const product = button.closest('.product')
            const proName = product.querySelector('.proName')
            const proPrice = product.querySelector('.proPrice')
            if (button.dataset.isEditing === 'false') {
                // 进入编辑模式
                const currentproName = proName.textContent;
                proName.innerHTML = `<input type="text" class="editname" value="${currentproName}" />`;
                const currentproPrice = proPrice.textContent;
                proPrice.innerHTML = `<input type="text" class="editprice" value="${currentproPrice}" />`;
                button.textContent = '完成';
                button.dataset.isEditing = 'true';
            } else {
                // 完成编辑              
                const inputproName = product.querySelector('.editname').value;
                const inputproPrice = product.querySelector('.editprice').value;
                if (inputproName.length <= 0 || inputproName.length > 8 || parseFloat(inputproPrice) < 0 || parseFloat(inputproPrice) >= 100000 || inputproPrice.length <= 0) {
                    alert('修改要求：商品名1-8个字符、价格0-10000')
                }
                else {
                    proName.textContent = inputproName;
                    proPrice.textContent = inputproPrice;
                    button.textContent = '编辑';
                    button.dataset.isEditing = 'false'
                }
            }
        })
    })
}
//更新商品时检查商品是否还在编辑
function proisEditing() {
    let i = 0
    const getall = document.querySelector('body')
    //先判断所有商品是否完成编辑
    const editpro = getall.querySelectorAll('.editpro')
    editpro.forEach(button => {
        if (button.dataset.isEditing === 'true') {
            i = 1
        }
    })
    if (i == 1) {
        alert('有商品未完成编辑')
        return false
    }
    else return true
}
//更新新的商品信息到数据库
function MProDataBase() {
    const getall = document.querySelector('body')
    const updatepro = getall.querySelector('.updatepro')
    updatepro.addEventListener('click', function () {
        if (proisEditing()) {
            let updateType = ``
            const getallproduct = getall.querySelectorAll('.product')
            for (let i = 0; i < getallproduct.length; i++) {
                const productID = getallproduct[i].getAttribute('id')
                const proName = getallproduct[i].querySelector('.proName').textContent
                const proPrice = parseFloat(getallproduct[i].querySelector('.proPrice').textContent)
                const proImg_url = getallproduct[i].querySelector('.proImg').src
                updateType += `
                update product 
                set pname='${proName}', price=${proPrice}, img_url='${proImg_url}'
                where id='${productID}';
                `;
            }
            fetch('/updatePro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    updateType: updateType,
                })
            })
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        alert(res.message)
                    }
                    else {
                        alert(res.message)
                    }
                })
        }
    })
}
//下架商品信息
function Mremovepro() {
    const getall = document.querySelector('body')
    const removepro = getall.querySelectorAll('.removepro')
    removepro.forEach(button => {
        button.addEventListener('click', function () {
            //获取该商品的父容器
            const product = button.closest('.product')
            //获取该商品的信息
            const proName = product.querySelector('.proName')
            const proPrice = product.querySelector('.proPrice')
            if (proName.textContent == '该商品已下架' && proPrice.textContent == '0') {
                alert('该商品已下架')
            }
            else if (confirm('确定下架该商品？')) {
                proName.textContent = '该商品已下架'
                proPrice.textContent = '0'
            }
        })
    })
}
//输出管理界面
function showmanagement() {
    const getall = document.querySelector('body')
    const usermanagement = document.createElement('div')
    usermanagement.classList.add('usermanagement')
    usermanagement.innerHTML = `
        <div class="Mnav">
            <span>用户管理</span>
            <button class="searchUserbutton"><img src="./images/search.png" alt="search" width="100%"></button>
            <input type="text" class="searchUserinput" placeholder="输入用户邮箱">
        </div>
        <div class="Mbody">
            <div class="Mbody-nav">
                <div class="number">#</div>
                <div class="email">用户邮箱</div>
                <div class="name">用户昵称</div>
                <div class="pwd">用户密码</div>
                <div class="money">余额</div>
                <div class="update">修改</div>
            </div>
            <div class="Mbody-body"></div> 
        </div>`
    const ordermanagement = document.createElement('div')
    ordermanagement.classList.add('ordermanagement')
    ordermanagement.innerHTML = `
        <div class="Onav">
            <span>订单管理</span>
            <button class="searchUserbutton"><img src="./images/search.png" alt="search" width="100%"></button>
            <input type="text" class="searchUserinput" placeholder="输入用户邮箱">
            <label for="selectpro">选择商品状态:</label>
            <select id="selectpro" name="status">
                <option value="全部">全部</option>
                <option value="已发货">已发货</option>
                <option value="未发货">未发货</option>
            </select>
        </div>
        <div class="Obody">
            <div class="Obody-nav">
                <div class="number">#</div>
                <div class="orderId">订单编号</div>
                <div class="orderemail">订单邮箱</div>
                <div class="ordertime">订单时间</div>
                <div class="proName">商品名</div>
                <div class="proCount">数量</div>
                <div class="countMoney">总计</div>
                <div class="status">商品状态</div>
                <button class="sendAll">一键发货</button>
            </div>
            <div class="Obody-body"></div>
        </div> `
    getall.appendChild(usermanagement)
    getall.appendChild(ordermanagement)
    //获取用户信息
    MReadUserDataBase()
}
//从本地读取用户信息
function getuseraccount() {
    let getuseraccount = localStorage.getItem(`useraccount`)
    if (getuseraccount) {
        let useraccount = JSON.parse(getuseraccount)
        return useraccount
    }
}
//从本地读取管理员历史订单
function getManagerOrder() {
    let getManagerOrder = localStorage.getItem(`ManagerOrder`)
    if (getManagerOrder) {
        let ManagerOrder = JSON.parse(getManagerOrder)
        return ManagerOrder
    }
}
//读取数据库用户表存入本地存储
function MReadUserDataBase() {
    fetch('/searchUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                localStorage.setItem(`useraccount`, JSON.stringify(res.data))
                MReadUserOrderDataBase()
            }
        })
}
//读取数据库管理员历史订单表存入本地存储
function MReadUserOrderDataBase() {
    fetch('/searchManagerOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                localStorage.setItem(`ManagerOrder`, JSON.stringify(res.data))
                //展示用户信息和订单信息
                showUserAndOrder()
            }
        })
}
//展示用户信息和订单信息
function showUserAndOrder() {
    let useraccount = getuseraccount()
    let ManagerOrder = getManagerOrder()
    const getall = document.querySelector('body')
    const usermanagement = getall.querySelector('.usermanagement')
    const Mbodybody = usermanagement.querySelector('.Mbody-body')
    for (let i = 0; i < useraccount.length; i++) {
        const user = document.createElement('div')
        user.classList.add('user')
        user.innerHTML = `
                     <div class="number">${i + 1}</div>
                    <div class="email">${useraccount[i].email}</div>
                    <div class="name">${useraccount[i].uname}</div>
                    <div class="pwd">${useraccount[i].pwd}</div>
                    <div class="money">${useraccount[i].umoney}</div>
                    <button class="update">修改</button>`
        Mbodybody.appendChild(user)
    }
    const ordermanagement = getall.querySelector('.ordermanagement')
    const Obodybody = ordermanagement.querySelector('.Obody-body')
    for (let i = 0; i < ManagerOrder.length; i++) {
        if (ManagerOrder[i].status == '未发货') {
            const Morder = document.createElement('div')
            Morder.classList.add('Morder')
            const countMoney = (parseFloat(ManagerOrder[i].price) * parseInt(ManagerOrder[i].count)).toFixed(2)
            Morder.innerHTML = `
                <div class="number">${i + 1}</div>
                <div class="orderId">${ManagerOrder[i].orderId}</div>
                <div class="orderemail">${ManagerOrder[i].email}</div>
                <div class="ordertime">${ManagerOrder[i].ordertime}</div>
                <div class="proName">${ManagerOrder[i].pname}</div>
                <div class="proCount">${ManagerOrder[i].count}</div>
                <div class="countMoney">${countMoney}</div>
                <div class="status">${ManagerOrder[i].status}</div>
                <button class="send">发货</button>`
            Obodybody.appendChild(Morder)
        }
        if (ManagerOrder[i].status == '已发货') {
            const Morder = document.createElement('div')
            Morder.classList.add('Morder')
            const countMoney = (parseFloat(ManagerOrder[i].price) * parseInt(ManagerOrder[i].count)).toFixed(2)
            Morder.innerHTML = `
                <div class="number">${i + 1}</div>
                <div class="orderId">${ManagerOrder[i].orderId}</div>
                <div class="orderemail">${ManagerOrder[i].email}</div>
                <div class="ordertime">${ManagerOrder[i].ordertime}</div>
                <div class="proName">${ManagerOrder[i].pname}</div>
                <div class="proCount">${ManagerOrder[i].count}</div>
                <div class="countMoney">${countMoney}</div>
                <div class="status">${ManagerOrder[i].status}</div>
                `
            Obodybody.appendChild(Morder)
        }
    }
    //读取所有编辑用户按钮
    editUser()
    //重新监听发货按钮
    MsendOnepro()
}
//管理员查询单个用户
function MsearchUser() {
    const getall = document.querySelector('body')
    const usermanagement = getall.querySelector('.usermanagement')
    const searchUserbutton = usermanagement.querySelector('.searchUserbutton')
    searchUserbutton.addEventListener('click', function () {
        const Mbodybody = usermanagement.querySelector('.Mbody-body')
        const searchUserinput = usermanagement.querySelector('.searchUserinput').value
        let useraccount = getuseraccount()
        if (searchUserinput) {
            //添加一个倒计时在5s内无法再次点击查询
            let clicktime = 5
            const button = this
            button.disabled = true
            button.innerHTML = clicktime
            let clicktimeinterval = setInterval(function () {
                clicktime--
                button.innerHTML = clicktime
                if (clicktime <= 0) {
                    clearInterval(clicktimeinterval)
                    button.disabled = false
                    button.innerHTML = `<img src="./images/search.png" alt="search" width="100%">`
                }
            }, 1000)
            //输出搜索的用户
            Mbodybody.innerHTML = ``
            for (let i = 0; i < useraccount.length; i++) {
                if (useraccount[i].email == searchUserinput) {
                    const user = document.createElement('div')
                    user.classList.add('user')
                    user.innerHTML = `
                     <div class="number">${i + 1}</div>
                    <div class="email">${useraccount[i].email}</div>
                    <div class="name">${useraccount[i].uname}</div>
                    <div class="pwd">${useraccount[i].pwd}</div>
                    <div class="money">${useraccount[i].umoney}</div>
                    <button class="update">修改</button>`
                    Mbodybody.appendChild(user)
                    //重新执行一次读取所有编辑用户按钮
                    editUser()
                    break
                }
            }
        }
        else if (searchUserinput == '') {
            Mbodybody.innerHTML = ``
            for (let i = 0; i < useraccount.length; i++) {
                const user = document.createElement('div')
                user.classList.add('user')
                user.innerHTML = `
                 <div class="number">${i + 1}</div>
                <div class="email">${useraccount[i].email}</div>
                <div class="name">${useraccount[i].uname}</div>
                <div class="pwd">${useraccount[i].pwd}</div>
                <div class="money">${useraccount[i].umoney}</div>
                <button class="update">修改</button>`
                Mbodybody.appendChild(user)
            }
            // 重新执行一次读取所有编辑用户按钮
            editUser()
        }
    })
}
//更新用户时检查用户是否还编辑
function userbuttonisEditing() {
    let i = 0
    const getall = document.querySelector('body')
    //先判断所有商品是否完成编辑
    const update = getall.querySelectorAll('.usermanagement .Mbody .Mbody-body .update')
    update.forEach(button => {
        if (button.dataset.isEditing === 'true') {
            i = 1
        }
    })
    if (i == 1) {
        alert('有用户未完成编辑')
        return false
    }
    else return true
}
//点击上传用户数据按钮
function Mupdateuser() {
    const getall = document.querySelector('body')
    const updateuser = getall.querySelector('.nav .updateuser')
    updateuser.addEventListener('click', function () {
        let useraccount = getuseraccount()
        let updateType = ``
        //检查编辑是否未完成
        if (userbuttonisEditing()) {
            const user = getall.querySelectorAll('.usermanagement .Mbody .Mbody-body .user')
            for (let i = 0; i < user.length; i++) {
                const email = user[i].querySelector('.email')
                const name = user[i].querySelector('.name')
                const pwd = user[i].querySelector('.pwd')
                const money = user[i].querySelector('.money')
                for (let j = 0; j < useraccount.length; j++) {
                    if (useraccount[j].email == email.textContent) {
                        let samename = (name.textContent != useraccount[j].uname)
                        let samepwd = (pwd.textContent != useraccount[j].pwd)
                        let samemoney = (money.textContent != useraccount[j].umoney)
                        if (samename || samepwd || samemoney) {
                            updateType += `update useraccount set uname='${name.textContent}',pwd='${pwd.textContent}',umoney=${parseFloat(money.textContent)} where email='${useraccount[j].email}';`
                            //修改本地用户表
                            useraccount[j].uname = name.textContent
                            useraccount[j].pwd = pwd.textContent
                            useraccount[j].umoney = money.textContent
                            localStorage.setItem(`useraccount`, JSON.stringify(useraccount))
                            break
                        }
                    }
                }
            }
            if (updateType) {
                //更改用户表
                fetch('/updateUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        updateType: updateType,
                    })
                })

                    .then(response => response.json())
                    .then(res => {
                        if (res.success) {
                            alert(res.message)
                        }
                        else {
                            alert(res.message)
                        }
                    })
            }
            else {
                alert('无用户修改')
            }

        }

    })
}
// 管理员查询单个用户的历史订单
function MsearchUserOrder() {
    const getall = document.querySelector('body')
    const ordermanagement = getall.querySelector('.ordermanagement')
    const searchUserbutton = ordermanagement.querySelector('.searchUserbutton')
    const Obodybody = ordermanagement.querySelector('.Obody-body')
    searchUserbutton.addEventListener('click', function () {
        const selectpro = getall.querySelector('.ordermanagement .Onav #selectpro').value
        const searchUserinput = ordermanagement.querySelector('.searchUserinput').value
        let ManagerOrder = getManagerOrder()
        // 添加一个倒计时在5秒内无法再次点击查询
        let clicktime = 5
        const button = this
        button.disabled = true
        button.innerHTML = clicktime
        const clicktimeinterval = setInterval(() => {
            clicktime--
            button.innerHTML = clicktime
            if (clicktime <= 0) {
                clearInterval(clicktimeinterval)
                button.disabled = false
                button.innerHTML = `<img src="./images/search.png" alt="search" width="100%">`
            }
        }, 1000)
        // 清空之前的订单
        Obodybody.innerHTML = ''
        // 过滤并显示订单
        const filteredOrders = ManagerOrder.filter(order => {
            const matchesEmail = !searchUserinput || order.email === searchUserinput
            const matchesStatus = selectpro === '全部' || order.status === selectpro
            return matchesEmail && matchesStatus;
        })
        // 显示过滤后的订单
        filteredOrders.forEach((order, index) => {
            const countMoney = (parseFloat(order.price) * parseInt(order.count)).toFixed(2)
            const Morder = document.createElement('div')
            Morder.classList.add('Morder')
            Morder.innerHTML = `
                <div class="number">${index + 1}</div>
                <div class="orderId">${order.orderId}</div>
                <div class="orderemail">${order.email}</div>
                <div class="ordertime">${order.ordertime}</div>
                <div class="proName">${order.pname}</div>
                <div class="proCount">${order.count}</div>
                <div class="countMoney">${countMoney}</div>
                <div class="status">${order.status}</div>
                ${order.status === '已发货' ? '' : '<button class="send">发货</button>'}`
            Obodybody.appendChild(Morder)
        })
        //重新监听发货按钮
        MsendOnepro()
    })
}
//修改用户的信息
function editUser() {
    const getall = document.querySelector('body')
    const update = getall.querySelectorAll('.usermanagement .Mbody .Mbody-body .user .update')
    update.forEach(button => {
        button.dataset.isEditing = 'false'
        button.addEventListener('click', function () {
            const user = button.parentNode
            const email = user.querySelector('.email')
            const name = user.querySelector('.name')
            const pwd = user.querySelector('.pwd')
            const money = user.querySelector('.money')
            if (button.dataset.isEditing === 'false') {
                // 进入编辑模式
                const currentname = name.textContent;
                name.innerHTML = `<input type="text" class="editusernameInput" value="${currentname}" />`;
                const currentpwd = pwd.textContent;
                pwd.innerHTML = `<input type="text" class="edituserpwdInput" value="${currentpwd}" />`;
                const currentmoney = money.textContent;
                money.innerHTML = `<input type="text" class="editusermoneyInput" value="${currentmoney}" />`;
                button.textContent = '完成';
                button.dataset.isEditing = 'true';
            } else {
                // 完成编辑
                const inputname = user.querySelector('.editusernameInput').value;
                const inputpwd = user.querySelector('.edituserpwdInput').value;
                const inputmoney = user.querySelector('.editusermoneyInput').value;
                let truename = inputname.length > 0 && inputname.length <= 8
                let truepwd = inputpwd.length >= 6 && inputpwd.length <= 18
                let truemoney = parseFloat(inputmoney) > 0 && parseFloat(inputmoney) <= 1000000000
                if (!truemoney || !truename || !truepwd) {
                    alert('用户昵称要在1-8个字符，用户密码要在6-18个字符，修改的金额要在0-100000000')
                }
                else {
                    money.textContent = inputmoney;
                    name.textContent = inputname;
                    pwd.textContent = inputpwd;
                    button.textContent = '修改';
                    button.dataset.isEditing = 'false'
                }
            }
        })
    })
}
// 管理员对商品状态选择
function MproStatus() {
    const getall = document.querySelector('body')
    const selectpro = getall.querySelector('.ordermanagement .Onav #selectpro')
    const Obodybody = getall.querySelector('.ordermanagement .Obody .Obody-body')
    selectpro.addEventListener('change', function () {
        const searchUserinput = getall.querySelector('.ordermanagement .searchUserinput').value
        const ManagerOrder = getManagerOrder()
        Obodybody.innerHTML = ''
        const selectvalue = this.value
        const appendOrder = (order, index) => {
            const countMoney = (parseFloat(order.price) * parseInt(order.count)).toFixed(2)
            const Morder = document.createElement('div')
            Morder.classList.add('Morder')
            Morder.innerHTML = `
                <div class="number">${index + 1}</div>
                <div class="orderId">${order.orderId}</div>
                <div class="orderemail">${order.email}</div>
                <div class="ordertime">${order.ordertime}</div>
                <div class="proName">${order.pname}</div>
                <div class="proCount">${order.count}</div>
                <div class="countMoney">${countMoney}</div>
                <div class="status">${order.status}</div>
                ${order.status === '已发货' ? '' : '<button class="send">发货</button>'}`// 根据状态决定是否显示发货按钮
            Obodybody.appendChild(Morder);
        }
        const filteredOrders = ManagerOrder.filter(order => {
            const matchesEmail = !searchUserinput || order.email === searchUserinput
            const matchesStatus = selectvalue === '全部' || order.status === selectvalue
            return matchesEmail && matchesStatus
        })
        filteredOrders.forEach(appendOrder)
        //重新监听发货按钮
        MsendOnepro()
    })
}
//管理员一键发货
function MsendAllpro() {
    const getall = document.querySelector('body')
    const sendAll = getall.querySelector('.ordermanagement .Obody .Obody-nav .sendAll')
    sendAll.addEventListener('click', function () {
        if (confirm('确定订单无误，发送邮件至用户邮箱')) {
            const uniqueEmails = new Set()// 用于存储唯一邮件地址
            const ManagerOrder = getManagerOrder()
            const Morders = getall.querySelectorAll('.ordermanagement .Obody .Obody-body .Morder')
            let updateType = ``
            Morders.forEach(Morder => {
                const status = Morder.querySelector('.status')
                if (status.textContent == '未发货') {
                    const orderId = Morder.querySelector('.orderId').textContent
                    const proName = Morder.querySelector('.proName').textContent
                    const email = Morder.querySelector('.orderemail').textContent
                    const send = Morder.querySelector('.send')
                    uniqueEmails.add(email)
                    updateType += `update [order_${email}] set status='已发货' where orderId='${orderId}';
                    update managerOrder set status='已发货' where orderId='${orderId}';
                    `
                    //修改本地的管理员历史订单
                    for (let i = 0; i < ManagerOrder.length; i++) {
                        if (ManagerOrder[i].orderId == orderId) {
                            ManagerOrder[i].status = '已发货'
                            localStorage.setItem(`ManagerOrder`, JSON.stringify(ManagerOrder))
                            break
                        }
                    }
                    //修改当前展示
                    status.textContent = '已发货'
                    Morder.removeChild(send)
                }
            })
            const emailArray = Array.from(uniqueEmails)
            for (let i = 0; i < emailArray.length; i++) {
                let sendEmailType = `您有多个订单已发货`
                MOrderemail(emailArray[i], sendEmailType)
            }

            if (updateType) {
                fetch('/updateUserOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        updateType: updateType,
                    })
                })
                    .then(response => response.json())
                    .then(res => {
                        if (res.success) {
                            alert("订单发货通知已发送到用户的邮箱！");
                        }
                    })
            }
            else {
                alert('无可发货订单')
            }
        }
    })
}
//管理员单次发货
function MsendOnepro() {
    const getall = document.querySelector('body')
    const send = getall.querySelectorAll('.ordermanagement .Obody .Obody-body .send')
    send.forEach(button => {
        button.addEventListener('click', function () {
            if (confirm('确定订单无误，发送邮件至用户邮箱')) {
                let updateType = ``
                let sendEmailType = ``
                const ManagerOrder = getManagerOrder()
                const Morder = button.parentNode
                const orderId = Morder.querySelector('.orderId').textContent
                const proName = Morder.querySelector('.proName').textContent
                const email = Morder.querySelector('.orderemail').textContent
                const status = Morder.querySelector('.status')
                updateType += `update [order_${email}] set status='已发货' where orderId='${orderId}';
                        update managerOrder set status='已发货' where orderId='${orderId}';
                        `
                sendEmailType += `您的订单编号为${orderId}、商品名为${proName}的商品已发货`
                //修改本地的管理员历史订单
                for (let i = 0; i < ManagerOrder.length; i++) {
                    if (ManagerOrder[i].orderId == orderId) {
                        ManagerOrder[i].status = '已发货'
                        localStorage.setItem(`ManagerOrder`, JSON.stringify(ManagerOrder))
                        break
                    }
                }
                //修改当前展示
                status.textContent = '已发货'
                Morder.removeChild(button)
                if (updateType) {
                    fetch('/updateUserOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            updateType: updateType,
                        })
                    })
                        .then(response => response.json())
                        .then(res => {
                            if (res.success) {
                                //发邮件
                                MOrderemail(email, sendEmailType)
                                alert("订单发货通知已发送到用户的邮箱！");
                            }
                        })
                }
                else {
                    alert('无可发货订单')
                }
            }
        })
    })
}
//发送发货订单邮件
function MOrderemail(email, sendEmailType) {
    fetch('/sendOrderToemail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            sendEmailType: sendEmailType
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}
//----------------主页所有功能-----------------------------
function indexfunction() {
    document.addEventListener('DOMContentLoaded', () => {
        showProduct().then(() => {
            let whologin = checkWhologin()
            if (whologin.who == 'nobody') {
                //未登录导航栏
                nobodynav()
                //未登录禁用所有按钮
                banbutton()
            }
            if (whologin.who == 'user') {
                //禁止多次刷新
                banrefresh()
                //用户导航栏
                usernav(whologin)
                //禁止登录后5秒内退出
                banlogout()
                //读取数据库购物车
                Usercartdatabase(whologin)
                //用户点击购物车页面
                Gocart(whologin)
                //用户点击历史订单页面
                Goorder(whologin)
                //切换页面更新余额
                updatemoney()
                //商品加入购物车
                ADDcart(whologin)
                //关闭页面或刷新时更新购物车
                window.addEventListener('beforeunload', function () {
                    updatePaycart(whologin)
                });
            }
            if (whologin.who == 'manager') {
                //禁止多次刷新
                banrefresh()
                //管理员导航栏
                Mnav(whologin)
                //禁止登录后5s内退出
                banlogout()
                //更新页面的商品框的内容
                Mprobox()
                //上传商品图片
                Muploadproimg()
                //编辑商品
                Meditpro()
                //删除商品
                Mremovepro()
                //更新商品信息
                MProDataBase()
                //管理界面
                showmanagement()
                //搜索用户
                MsearchUser()
                //搜索用户订单
                MsearchUserOrder()
                //做到这
                //选择商品状态
                MproStatus()
                //一键发货
                MsendAllpro()
                //更新用户信息
                Mupdateuser()
            }
        })
    });
}
function orderfunction() {
    let whologin = ordergetUser()
    //点击购物车按钮
    Gocart(whologin)
    //点击返回首页按钮
    GoIndex(whologin)
    //展示用户历史订单
    showUserorder(whologin)
    //删除订单
    deleteorder(whologin)
}
function cartfunction() {
    //不允许在5秒内重复刷新
    banrefresh()
    let whologin = cartgetUser()
    //显示个人购物车
    showcart(whologin)
    //点击历史订单按钮
    Goorder(whologin)
    //点击返回首页按钮
    GoIndex(whologin)
    //点击增加按钮
    ADDproduct(whologin)
    //点击减少按钮
    Reduceproduct(whologin)
    //单选全选按钮
    select(whologin)
    //点击移除按钮
    deleteproduct(whologin)
    //购买商品
    checkoutproduct(whologin)
    //页面关闭时将本地购物车的内容插入到数据库里
    window.addEventListener('beforeunload', function () {
        updatePaycart(whologin)
    })
}