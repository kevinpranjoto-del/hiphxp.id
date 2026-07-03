import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import { hashPassword, comparePassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, artistName, realName, whatsapp, city, label, instagram, tiktok, spotifyArtistUrl, appleMusicUrl, youtubeChannel, profilePhoto, bio } = req.body;

    if (!email || !password || !artistName || !realName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await hashPassword(password);
    const user = await prisma.user.create({
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.account_type });
    const refreshToken = signRefreshToken({ sub: user.id });

    await prisma.refreshToken.create({ data: { user_id: user.id, token_hash: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    await prisma.loginHistory.create({ data: { user_id: user.id, ip_address: req.ip, user_agent: req.get('user-agent') || undefined, success: true } });

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });

    const payload = verifyRefreshToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findFirst({ where: { user_id: payload.sub as string, revoked_at: null } });
    if (!tokenRecord) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ sub: payload.sub, role: 'MUSICIAN' });
    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token invalid' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({ where: { token_hash: refreshToken }, data: { revoked_at: new Date() } });
    }
    return res.json({ message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
});

router.post('/verify-email', async (_req, res) => res.json({ message: 'Email verification endpoint ready' }));
router.post('/forgot-password', async (_req, res) => res.json({ message: 'Forgot password endpoint ready' }));
router.post('/reset-password', async (_req, res) => res.json({ message: 'Reset password endpoint ready' }));

export default router;
