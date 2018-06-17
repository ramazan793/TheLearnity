var history = require('connect-history-api-fallback');

var fix_middleware = history();

var router = require('express').Router();

router.get('/collections',fix_middleware);
router.get('/manage',fix_middleware);
router.get('/learning',fix_middleware);
router.get('/check',fix_middleware);

module.exports = router
