export interface UserModel {
  name: string,
  organisation: string,
  roles: Array<UserRolesEnum>
}

export enum UserRolesEnum {
  StudyViewer= 'studyViewer',
  StudyOperator= 'studyOperator',
  StudyAdministrator= 'studyAdministrator',
  SystemAdministrator= 'systemAdministrator'
}
