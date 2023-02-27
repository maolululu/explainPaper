export interface User  {
    id: string;
    email: string;
    roles: string[];
    profile: Profile;
  };
  
  export interface Profile {
    name: string;
    avatarUrl: string;
  };