import { PermissionType, isAuthorized } from '../../utils/authorization';

type Props = {
  permission: PermissionType;
  children: any;
  alt?: any;
};

const Authorization: (props: Props) => any = ({
  permission,
  children,
  alt,
}) => {
  if (isAuthorized(permission)) {
    return children;
  } else {
    return alt || null;
  }
};

export default Authorization;
