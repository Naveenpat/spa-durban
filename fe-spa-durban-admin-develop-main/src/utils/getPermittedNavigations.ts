import { NavigationItem } from '../navigation';
import { isAuthorized } from './authorization';

export const getPermittedNavigations = (navigations: NavigationItem[]) => {
  const result = navigations
    ?.filter((el) => {
      return el?.permissions
        ? el?.permissions?.some((permission) => isAuthorized(permission))
        : true;
    })
    ?.map((navigation) => {
      return {
        ...navigation,
        items: navigation?.items?.filter((item) =>
          isAuthorized(item.permission),
        ),
      };
    });

  return result;
};
