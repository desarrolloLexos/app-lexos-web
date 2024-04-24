import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Usuario {

  /* Forma corta de crear un modelo en typescript */
  constructor(
    public uid: string,  // Campo que apunta al UID de Firebase Authenticator, no a usuarios.
    public id: string,
    public id_person: number,
    public id_company: string,
    public id_assets_location: string,
    public email: string,
    public only_request: string,
    public active: boolean,
    public verify: string,
    public id_group_permission: string,
    public id_profile: string,
    public profiles_description: string,
    public groups_permissions_description: string,
    public name: string,
    public type_user: string,
    public account_item_description: string,
    public path_image: string,
    public is_changed: string,
    public enable_notifications: string,
    public tracking: string,
    public path_signature: string,
    public platform: string,
    public blocked_by_failure_intents: string,
    public num_login_intents_failure: string,
    public only_sso: string,
    public tasks_filter: string,
    public last_date_request: string,
    public last_date_forward_email: string,
    public has_two_factor_auth: string,
    public rut: string,
  ){}
}

/* Tipo que permite usar desestructuración de objeto en clase Usuario */
export type UsuarioType = {
  email: string,
  nombre: string,
  uid: string
}


// Firestore data converter
export const UsuarioConverter = {
  toFirestore: (user: Usuario) => {
      return {
          "uid": user.uid,
          "id": user.id,
					"id_person": user.id_person,
					"id_company": user.id_company,
					"id_assets_location": user.id_assets_location,
					"email": user.email,
					"only_request": user.only_request,
					"active": user.active,
					"verify": user.verify,
					"id_group_permission": user.id_group_permission,
					"id_profile": user.id_profile,
					"profiles_description": user.profiles_description,
					"groups_permissions_description": user.groups_permissions_description,
					"name": user.name,
					"type_user": user.type_user,
					"account_item_description": user.account_item_description,
					"path_image": user.path_image,
					"is_changed": user.is_changed,
					"enable_notifications": user.enable_notifications,
					"tracking": user.tracking,
					"path_signature": user.path_signature,
					"platform": user.platform,
					"blocked_by_failure_intents": user.blocked_by_failure_intents,
					"num_login_intents_failure": user.num_login_intents_failure,
					"only_sso": user.only_sso,
					"tasks_filter": user.tasks_filter,
					"last_date_request": user.last_date_request,
					"last_date_forward_email": user.last_date_forward_email,
					"has_two_factor_auth": user.has_two_factor_auth,
          "rut": user.rut
          };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>,
                  options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new Usuario(
        data['uid'],
        data['id'],
        data['id_person'],
        data['id_company'],
        data['id_assets_location'],
        data['email'],
        data['only_request'],
        data['active'],
        data['verify'],
        data['id_group_permission'],
        data['id_profile'],
        data['profiles_description'],
        data['groups_permissions_description'],
        data['name'],
        data['type_user'],
        data['account_item_description'],
        data['path_image'],
        data['is_changed'],
        data['enable_notifications'],
        data['tracking'],
        data['path_signature'],
        data['platform'],
        data['blocked_by_failure_intents'],
        data['num_login_intents_failure'],
        data['only_sso'],
        data['tasks_filter'],
        data['last_date_request'],
        data['last_date_forward_email'],
        data['has_two_factor_auth'],
        data['rut'],

        );
  }
};
