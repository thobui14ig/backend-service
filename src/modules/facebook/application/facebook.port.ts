export const FACEBOOK_PORT = Symbol('FACEBOOK_PORT');

export interface FacebookLinkInfo {
  type: string;
  [key: string]: unknown;
}

export interface FacebookPort {
  getLinkInfo(url: string): Promise<FacebookLinkInfo>;
  getComments(info: FacebookLinkInfo): Promise<unknown>;
}
