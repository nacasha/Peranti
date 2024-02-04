import { makeAutoObservable } from "mobx"

class FileDropStore {
  isHovering: boolean = false

  droppedFilePaths: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setIsHovering(value: boolean) {
    this.isHovering = value
  }

  setDroppedFilePaths(filePaths: string[]) {
    this.droppedFilePaths = filePaths
  }
}

export const fileDropStore = new FileDropStore()
