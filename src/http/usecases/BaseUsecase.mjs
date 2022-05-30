import Errors from '../../errors/Errors.mjs';
import { validateBySchema } from '../validation/schemaValidation.mjs';

/**
 * Базовый класс для usecase
 *
 * <--------------------------------------------------- PERMISSIONS --------------------------------------------------->
 * Чтобы ограничить права нужно в дочернем классе определить this.permission
 * строкой вида {названиеФункции_типФункции_названиеПрава}|{названиеФункции_названиеПрава}|{названиеПрава}
 *
 * названиеФункции - create|read|update|delete - по умолчанию read
 * типФункции      - any|own                   - по умолчанию own
 * названиеПрава   - offers|entities|users|...
 *
 * Примеры:
 *  - update_own_offers
 *  - create_entities (аналогично create_own_offers),
 *  - users (аналогично read_own_users)
 * >--------------------------------------------------- PERMISSIONS ---------------------------------------------------<
 */
export default class BaseUsecase {
  constructor(scope = null) {
    this.roleCode = scope?.roleCode;
    this.accessControl = scope?.accessControl;
    this.permission = null;
  }

  /**
   * Проверка прав при запросе страницы (обращение к функции prepare).
   */
  async checkAccess() {
    await this.checkPermissions(this.permission);
  }

  /**
   * Проверка наличия у пользователя необходимого права
   *
   * @param permission
   */
  async checkPermissions(permission) {
    if (permission) {
      const { functionName, permissionName } = this.parsePermission(permission);

      if (!this.accessControl.can(this.roleCode)[functionName](permissionName).granted) {
        throw Errors.forbidden();
      }
      if (functionName.substr(-3) === 'Own') {
        if (this.checkOwnPermissions && !(await this.checkOwnPermissions())) {
          throw Errors.forbidden();
        }
      }
    }
  }

  async checkOwnPermissions() {
    return true;
  }

  /**
   * @param permission {string}
   * @returns {{functionName: string, permissionName: string}}
   */
  parsePermission(permission) {
    const arr = permission.split('_');

    if (arr.length === 1) {
      return { functionName: 'readOwn', permissionName: arr[0] }
    }

    if (arr.length === 2) {
      return { functionName: arr[0] + 'Own', permissionName: arr[1] }
    }

    if (arr.length === 3) {
      return { functionName: arr[0] + arr[1].charAt(0).toUpperCase() + arr[1].slice(1), permissionName: arr[2] }
    }
  }

  async validate(request) {
    const schema = await this.schema(request);

    schema && validateBySchema(request, schema);
  };

  async initialize() {}

  async schema() {
    return null;
  }

  async process() {
    return null;
  }
}
