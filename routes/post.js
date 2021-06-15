const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router()

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어서 만듬');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => { // 이미지 하나를 업로드받은 뒤 이미지의 저장 경로를 클라이언트로 응답함. 
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { // 게시글 업로드를 처리함.
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]+/g); // 정규식을 이용하여 해시태그 추출
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            await post.addHashtags(result.map(r => r[0])); //게시글과 연결
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:postId/delete', isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId}});
        if(post) {
            await Post.destroy({where: {id: req.params.postId}});
            res.send('success');
        }
        else {
            res.status(404).send('Do not exist post')
        }
    } catch(err) {
        console.error(err);
        next(err);
    }
})

router.post('/:twitId/like', isLoggedIn, async (req, res, next) => {
    try{
        const user = await User.findOne({where: { id: req.user.id }});
        const post = await Post.findOne({where: { id: req.params.twitId }})
        if(user && post){
            await user.addLikePostList(parseInt(req.params.twitId), 10);
            res.send('success')
        } else {
            res.status(404).send('no user or no post')
        }
    } catch(err){
        console.error(err)
        next(err)
    }
})

router.post('/:twitId/unlike', isLoggedIn, async (req, res, next) => {
    try{
        const user = await User.findOne({where: { id: req.user.id }});
        const post = await Post.findOne({where: { id: req.params.twitId }})
        if(user && post){
            await user.removeLikePostList(parseInt(req.params.twitId), 10);
            res.send('success')
        } else {
            res.status(404).send('no user or no post')
        }
    } catch(err){
        console.error(err)
        next(err)
    }
})

module.exports = router;