"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../shared/prisma");
const auth_1 = require("../../shared/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password, artistName, realName, whatsapp, city, label, instagram, tiktok, spotifyArtistUrl, appleMusicUrl, youtubeChannel, profilePhoto, bio } = req.body;
        if (!email || !password || !artistName || !realName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        const password_hash = await (0, auth_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password_hash,
                account_type: 'MUSICIAN',
                role: { connect: { name: 'MUSICIAN' } },
                musician_profile: {
                    create: {
                        artist_name: artistName,
                        real_name: realName,
                        whatsapp,
                        city,
                        label,
                        instagram,
                        tiktok,
                        spotify_artist_url: spotifyArtistUrl,
                        apple_music_url: appleMusicUrl,
                        youtube_channel: youtubeChannel,
                        profile_photo: profilePhoto,
                        bio,
                    },
                },
            },
        });
        return res.status(201).json({ message: 'Musician registration submitted', user: { id: user.id, email: user.email } });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Registration failed' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await (0, auth_1.comparePassword)(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = (0, auth_1.signAccessToken)({ sub: user.id, email: user.email, role: user.account_type });
        const refreshToken = (0, auth_1.signRefreshToken)({ sub: user.id });
        await prisma_1.prisma.refreshToken.create({ data: { user_id: user.id, token_hash: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
        await prisma_1.prisma.loginHistory.create({ data: { user_id: user.id, ip_address: req.ip, user_agent: req.get('user-agent') || undefined, success: true } });
        return res.json({ accessToken, refreshToken });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Login failed' });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'Missing refresh token' });
        const payload = (0, auth_1.verifyRefreshToken)(refreshToken);
        const tokenRecord = await prisma_1.prisma.refreshToken.findFirst({ where: { user_id: payload.sub, revoked_at: null } });
        if (!tokenRecord)
            return res.status(401).json({ message: 'Invalid refresh token' });
        const accessToken = (0, auth_1.signAccessToken)({ sub: payload.sub, role: 'MUSICIAN' });
        return res.json({ accessToken });
    }
    catch (error) {
        return res.status(401).json({ message: 'Refresh token invalid' });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await prisma_1.prisma.refreshToken.updateMany({ where: { token_hash: refreshToken }, data: { revoked_at: new Date() } });
        }
        return res.json({ message: 'Logged out' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Logout failed' });
    }
});
router.post('/verify-email', async (_req, res) => res.json({ message: 'Email verification endpoint ready' }));
router.post('/forgot-password', async (_req, res) => res.json({ message: 'Forgot password endpoint ready' }));
router.post('/reset-password', async (_req, res) => res.json({ message: 'Reset password endpoint ready' }));
exports.default = router;
