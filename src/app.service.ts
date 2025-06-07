import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
  checkHealth(): string {
    return "System health is OK"
  }
}
