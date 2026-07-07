export interface VideoRoom {
  roomName: string;
  roomUrl: string;
  expiresAt?: Date;
}

export interface IVideoProvider {
  createRoom(name: string, expiresAt?: Date): Promise<VideoRoom>;
  deleteRoom(roomName: string): Promise<void>;
}
