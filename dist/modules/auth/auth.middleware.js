import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { roleRights } from '../../config/roles';

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    if (!userRights) return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};
const authMiddleware =
  (...requiredRights) =>
  async (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
export default authMiddleware;
// # sourceMappingURL=auth.middleware.js.map
