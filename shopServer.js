let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GEt, POST , OPTIONS, PUT, PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
});
const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
let { shops, products, purchases } = require("./Shopdata.js");


app.get("/shops", function (req, res) {
    res.send(shops)
});
app.get("/shops/:id", function (req, res) {
    let id = +req.params.id;
    const shop = shops.find((st) => st.shopId === id);
    if (shop) {
        res.send(shop);
    } else {
        res.status(404).send("Shop not found");
    }
});
app.post("/shops", function (req, res) {
    let body = req.body;
    console.log(body);
    let maxid = shops.reduce((acc, curr) => (curr.shopId >= acc ? curr.shopId : acc), 0);
    let newid = maxid + 1;
    let newStudent = { shopId: newid, ...body }
    shops.push(newStudent);
    res.send(newStudent);
});
app.get("/products", function (req, res) {
    res.send(products)
});
app.get("/products/:id", function (req, res) {
    let id = +req.params.id;
    const prod = products.find((st) => st.productId === id);
    if (prod) {
        res.send(prod);
    } else {
        res.status(404).send("Shop not found");
    }
});
app.post("/products", function (req, res) {
    let body = req.body;
    console.log(body);
    let maxid = products.reduce((acc, curr) => (curr.productId >= acc ? curr.productId : acc), 0);
    let newid = maxid + 1;
    let newproduct = { productId: newid, ...body }
    products.push(newproduct);
    res.send(newproduct);
});
app.put("/products/:id", function (req, res) {
    const id = +req.params.id;
    const body = req.body;
    const index = products.findIndex((product) => product.productId === id);

    if (index >= 0) {

        if (body.productName && body.category && body.description) {
            products[index].productName = body.productName;
            products[index].category = body.category;
            products[index].description = body.description;
            res.send(products[index]);
        } else {
            res.status(400).send("Invalid request body. Please provide all required fields.");
        }
    } else {
        res.status(404).send("No Product found");
    }
});


const shopNameToIdMap = {
    "st1": 1,
    "st2": 2,
    "st3": 3,
    "st4": 4
};
const productNameToIdMap = {
    "pr1": 1,
    "pr2": 2,
    "pr3": 3,
    "pr4": 4,
    "pr5": 5,
    "pr6": 6,
    "pr7": 7,
    "pr8": 8,

};

app.get('/purchase', (req, res) => {
    const { shop, product, sort } = req.query;
    let filteredPurchases = [...purchases];

    if (shop) {
        const shopCriteria = shop.split(',');
        filteredPurchases = filteredPurchases.filter(purchase => {
            const shopId = shopNameToIdMap[purchase.shopId] || purchase.shopId;
            return shopCriteria.includes(`st${shopId}`);
        });
    }

    if (product) {
        const productCriteria = product.split(',');
        filteredPurchases = filteredPurchases.filter(purchase => {
            const productId = productNameToIdMap[`pr${purchase.productid}`] || purchase.productid;
            return productCriteria.includes(`pr${productId}`);
        });
    }

    if (sort) {
        const sortParams = sort.split(',');
        sortParams.forEach(param => {
            const [field, order] = param.endsWith('Asc') ? [param.slice(0, -3), 'asc'] : [param.slice(0, -4), 'desc'];

            if (field === 'Qty' && order === 'asc') {
                filteredPurchases.sort((a, b) => a.quantity - b.quantity);
            } else if (field === 'Qty' && order === 'desc') {
                filteredPurchases.sort((a, b) => b.quantity - a.quantity);
            } else if (field === 'Value' && order === 'asc') {
                filteredPurchases.sort((a, b) => a.quantity * a.price - b.quantity * b.price);
            } else if (field === 'Value' && order === 'desc') {
                filteredPurchases.sort((a, b) => b.quantity * b.price - a.quantity * a.price);
            }
        });
    }

    res.json(filteredPurchases);
});


app.get("/purchase/:id", function (req, res) {
    let id = +req.params.id;
    const prod = purchases.find((st) => st.purchaseId === id);
    if (prod) {
        res.send(prod);
    } else {
        res.status(404).send("Shop not found");
    }
});
app.get("/purchase/shops/:id", function (req, res) {
    let id = +req.params.id;
    const prod = purchases.filter((st) => st.shopId === id);
    if (prod) {
        res.send(prod);
    } else {
        res.status(404).send("Shop not found");
    }
});
app.get("/purchase/product/:id", function (req, res) {
    let id = +req.params.id;
    const prod = purchases.filter((st) => st.productid === id);
    if (prod) {
        res.send(prod);
    } else {
        res.status(404).send("Shop not found");
    }
});
app.post("/purchase", function (req, res) {
    let body = req.body;
    console.log(body);
    let maxid = purchases.reduce((acc, curr) => (curr.purchaseId >= acc ? curr.purchaseId : acc), 0);
    let newid = maxid + 1;
    let newproduct = { purchaseId: newid, ...body }
    purchases.push(newproduct);
    res.send(newproduct);
});
app.get('/totalPurchase/shop/:id', (req, res) => {
    const shopId = +req.params.id;

    const shopPurchases = purchases.filter(purchase => purchase.shopId === shopId);

    const productTotals = {};
    shopPurchases.forEach(purchase => {
        if (!productTotals[purchase.productid]) {
            productTotals[purchase.productid] = {
                productid: purchase.productid,
                totalQuantity: 0,
                totalValue: 0,
            };
        }
        productTotals[purchase.productid].totalQuantity += purchase.quantity;
        productTotals[purchase.productid].totalValue += purchase.quantity * purchase.price;
    });

    const result = Object.values(productTotals).map(item => ({
        productid: item.productid,
        totalQuantity: item.totalQuantity,
        totalValue: item.totalValue,
    }));

    res.json(result);
});

app.get('/totalPurchase/product/:id', (req, res) => {
    const productId = +req.params.id;
    const productPurchases = purchases.filter(purchase => purchase.productid === productId);
    const shopTotals = {};
    productPurchases.forEach(purchase => {
        if (!shopTotals[purchase.shopId]) {
            shopTotals[purchase.shopId] = {
                shopId: purchase.shopId,
                totalQuantity: 0,
                totalValue: 0,
            };
        }
        shopTotals[purchase.shopId].totalQuantity += purchase.quantity;
        shopTotals[purchase.shopId].totalValue += purchase.quantity * purchase.price;
    });

    const result = Object.values(shopTotals).map(item => ({
        shopId: item.shopId,
        totalQuantity: item.totalQuantity,
        totalValue: item.totalValue,
    }));

    res.json(result);
});
