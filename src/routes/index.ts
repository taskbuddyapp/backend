import checkExistence from "./v1/accounts/check-existence";
import create from "./v1/accounts/create";
import login from "./v1/accounts/login";
import me from "./v1/accounts/me";
import profile from "./v1/accounts/me/profile";
import callPhone from "./v1/accounts/verification/phone/call";
import sendPhone from "./v1/accounts/verification/phone/send";
import verifyPhone from "./v1/accounts/verification/phone/verify";
import ping from "./v1/ping";
import posts from "./v1/posts";
import tags from "./v1/posts/tags";
import mePosts from "./v1/accounts/me/posts";
import post_slug from "./v1/posts/[uuid]";
import search from "./v1/search";
import nearby from "./v1/posts/nearby";
import follow from "./v1/accounts/[uuid]/follow";
import accounts from "./v1/accounts/[uuid]";
import getAccountPosts from "./v1/accounts/[uuid]/posts";
import like from "./v1/posts/[uuid]/interactions/like";
import bookmark from "./v1/posts/[uuid]/interactions/bookmark";
import meBookmarks from "./v1/accounts/me/posts/bookmarks";
import share from "./v1/posts/[uuid]/interactions/share";
import fcm from "./v1/accounts/me/fcm";

export type route = {
    path: string;
    handler: any;
};

const postRoutes: route[] = [
    {
        path: "/v1/posts/tags",
        handler: tags,
    },
    {
        path: "/v1/posts/nearby",
        handler: nearby,
    },
    {
        path: "/v1/posts/:uuid/interactions/like",
        handler: like,
    },
    {
        path: "/v1/posts/:uuid/interactions/bookmark",
        handler: bookmark,
    },
    {
        path: "/v1/posts/:uuid/interactions/share",
        handler: share,
    },
    {
        path: "/v1/posts/:uuid",
        handler: post_slug,
    },
    {
        path: "/v1/posts",
        handler: posts,
    },
];

const meRoutes: route[] = [
    {
        path: "/v1/accounts/me/posts/bookmarks",
        handler: meBookmarks,
    },
    {
        path: "/v1/accounts/me/posts",
        handler: mePosts,
    },
    {
        path: "/v1/accounts/me/profile",
        handler: profile,
    },
    {
        path: "/v1/accounts/me/fcm",
        handler: fcm,
    },
];

const verificationRoutes: route[] = [
    {
        path: "/v1/accounts/verification/phone/send",
        handler: sendPhone,
    },
    {
        path: "/v1/accounts/verification/phone/call",
        handler: callPhone,
    },
    {
        path: "/v1/accounts/verification/phone/verify",
        handler: verifyPhone,
    },
];

const userRoutes: route[] = [
    ...meRoutes,
    ...verificationRoutes,
    {
        path: "/v1/accounts/me/",
        handler: me,
    },
    {
        path: "/v1/accounts/login",
        handler: login,
    },
    {
        path: "/v1/accounts/create",
        handler: create,
    },
    {
        path: "/v1/accounts/check-existence",
        handler: checkExistence,
    },
    {
        path: "/v1/accounts/:uuid/follow",
        handler: follow,
    },
    {
        path: "/v1/accounts/:uuid/posts",
        handler: getAccountPosts,
    },
    {
        path: "/v1/accounts/:uuid",
        handler: accounts,
    },
];

const routes: route[] = [
    ...userRoutes,
    ...postRoutes,
    {
        path: "/v1/ping",
        handler: ping,
    },
    {
        path: "/v1/search",
        handler: search,
    },
];

export default routes;
