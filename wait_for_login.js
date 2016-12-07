.goto('https://byui.brightspace.com/d2l/login?noredirect=1')
    .evaluate(function () {
        document.querySelector('a.vui-button-primary').addEventListener('click', function addClick() {
            var ele = document.createElement("div");
            ele.setAttribute('id', "ILoggedIn")
            document.body.appendChild(ele);
        }, {
            once: true
        });
    })
    .type("#userName", authData.username)
    .type("#password", authData.password)
    //    .click("a.vui-button-primary")
    .setWaitTimeout(5,0,0)
	.wait("#ILoggedIn")
    .waitURL("https://byui.brightspace.com/d2l/home")