import { prisma } from '../db/prisma'

export interface CreatePhotoInput {
  pgId: number
  categoryId: number
  photoUrl: string
}

export class PhotoService {
  // Add photo to PG
  static async addPhoto(data: CreatePhotoInput) {
    return prisma.pGPhoto.create({
      data: {
        pgId: data.pgId,
        categoryId: data.categoryId,
        photoUrl: data.photoUrl,
      },
    })
  }

  // Get all photos for PG
  static async getPhotosByPG(pgId: number) {
    return prisma.pGPhoto.findMany({
      where: { pgId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get photo by ID
  static async getPhotoById(id: number, pgId: number) {
    return prisma.pGPhoto.findFirst({
      where: {
        id,
        pgId,
      },
      include: { category: true },
    })
  }

  // Delete photo
  static async deletePhoto(id: number, pgId: number) {
    return prisma.pGPhoto.deleteMany({
      where: {
        id,
        pgId,
      },
    })
  }

  // Delete all photos for PG
  static async deletePhotosByPG(pgId: number) {
    return prisma.pGPhoto.deleteMany({
      where: { pgId },
    })
  }

  // Get photo count for PG
  static async getPhotoCount(pgId: number) {
    return prisma.pGPhoto.count({
      where: { pgId },
    })
  }
}
