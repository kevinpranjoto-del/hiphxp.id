"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const prisma_1 = require("./shared/prisma");
const routes_1 = __importDefault(require("./modules/auth/routes"));
const routes_2 = __importDefault(require("./modules/content/routes"));
const routes_3 = __importDefault(require("./modules/events/routes"));
const routes_4 = __importDefault(require("./modules/partnership/routes"));
const routes_5 = __importDefault(require("./modules/dashboard/routes"));
const routes_6 = __importDefault(require("./modules/songs/routes"));
const routes_7 = __importDefault(require("./modules/users/routes"));
const routes_8 = __importDefault(require("./modules/artists/routes"));
const routes_9 = __importDefault(require("./modules/collectives/routes"));
const lifestyle_routes_1 = __importDefault(require("./modules/content/lifestyle.routes"));
const editorial_routes_1 = __importDefault(require("./modules/content/editorial.routes"));
const reviews_routes_1 = __importDefault(require("./modules/content/reviews.routes"));
const app = (0, express_1.default)();
const uploadDir = path_1.default.join(__dirname, '../public/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(path_1.default.join(uploadDir, 'audio'), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(uploadDir, 'images'), { recursive: true });
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.corsOrigin, credentials: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, express_rate_limit_1.default)({ windowMs: env_1.env.rateLimitWindowMs, max: env_1.env.rateLimitMax }));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/maintenance', (_req, res) => res.status(200).json({
    message: 'Maintenance / Coming Soon',
    status: 'maintenance',
    platform: 'HipHXP.id',
    backend: 'ready',
}));
app.use('/api/auth', routes_1.default);
app.use('/api/content', routes_2.default);
app.use('/api/events', routes_3.default);
app.use('/api/partnerships', routes_4.default);
app.use('/api/dashboard', routes_5.default);
app.use('/api/songs', routes_6.default);
app.use('/api/users', routes_7.default);
app.use('/api/artists', routes_8.default);
app.use('/api/collectives', routes_9.default);
app.use('/api/content/lifestyle', lifestyle_routes_1.default);
app.use('/api/content/editorials', editorial_routes_1.default);
app.use('/api/content/reviews', reviews_routes_1.default);
app.get('/api/docs', (_req, res) => res.json({
    message: 'Backend API documentation',
    endpoints: [
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/verify-email',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/refresh',
        '/api/auth/logout',
        '/api/content/articles',
        '/api/content/articles/:slug',
        '/api/songs',
        '/api/songs/:slug',
        '/api/users',
        '/api/users/:id',
        '/api/events',
        '/api/partnerships',
        '/api/partnerships/:id',
        '/api/artists',
        '/api/artists/:slug',
        '/api/dashboard/stats',
        '/maintenance',
    ],
}));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        app.listen(env_1.env.port, () => {
            console.log(`Server running on http://localhost:${env_1.env.port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
