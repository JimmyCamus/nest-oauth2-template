import { UserInterface } from '../interfaces/user.interface';

export type CustomRequest = Omit<Request, 'user'> & {
  user: UserInterface | undefined;
};
