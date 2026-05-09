import { Request, Response } from 'express'
import { prisma } from '../db/prisma'

// Add photo to PG
export const addPGPhoto = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params
    const { photoUrl } = req.body

    if (!photoUrl) {
      return res.status(400).json({ message: 'Photo URL is required' })
    }

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    const photo = await prisma.pGPhoto.create({
      data: {
        pgId: Number(pgId),
        photoUrl,
      },
    })

    res.status(201).json({
      message: 'Photo added successfully',
      data: photo,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error adding photo',
      error: error.message,
    })
  }
}

// Get all photos for a PG
export const getPGPhotos = async (req: Request, res: Response) => {
  try {
    const { pgId } = req.params

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: Number(pgId) },
    })

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' })
    }

    const photos = await prisma.pGPhoto.findMany({
      where: { pgId: Number(pgId) },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      data: photos,
      total: photos.length,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching photos',
      error: error.message,
    })
  }
}

// Delete photo
export const deletePGPhoto = async (req: Request, res: Response) => {
  try {
    const { pgId, photoId } = req.params

    const photo = await prisma.pGPhoto.deleteMany({
      where: {
        id: Number(photoId),
        pgId: Number(pgId),
      },
    })

    if (photo.count === 0) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    res.json({
      message: 'Photo deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error deleting photo',
      error: error.message,
    })
  }
}
