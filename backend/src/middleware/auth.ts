import * as Koa from 'koa';
import * as jwt from 'jsonwebtoken';
import {Student, StudentRepository} from "../model/student/student";
import {just, Maybe} from "../../../shared/tools/functools/maybe";

declare module "koa" {
    interface Request {
        student: Maybe<Student>;
        admin: boolean;
    }
}

/**
 * 鉴权中间件
 */
export async function authMiddleware(ctx: Koa.Context, next) {
    try {
        let token = ctx.request.header['authorization'].slice('Bearer '.length);
        let decoded = jwt.decode(token);
        ctx.request.student = just(await StudentRepository.getById(decoded['student']));
    } catch (e) {
        if (e instanceof TypeError) {
            ctx.request.student = just(null);
        }
    }
    await next();
}

export async function adminAuthMiddleware(ctx: Koa.Context, next) {
    if (process.env['ADMIN_TOKEN'] === undefined || process.env['ADMIN_TOKEN'] === null) {
        throw Error("Please set env variable ADMIN_TOKEN!")
    }
    ctx.request.admin = ctx.request.header['admintoken'] === process.env['ADMIN_TOKEN'];
    await next();
}