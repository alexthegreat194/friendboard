module.exports = (app) => {
    app.engine('hbs', engine({
        extname: 'hbs',
        defaultLayout: 'main'
    }));
    app.set('view engine', 'hbs');
    app.set('views', './views');
}