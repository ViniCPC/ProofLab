import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateResearchDto } from './dto/create-research.dto';
import type { ListResearchQueryDto } from './dto/list-research-query.dto';

@Injectable()
export class ResearchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateResearchDto, creator: PublicUser) {
    return this.prisma.researchProject.create({
      data: {
        title: dto.title,
        description: dto.description,
        totalAmount: dto.totalAmount,
        creatorId: creator.id,
        milestones: dto.milestones?.length
          ? {
              create: dto.milestones.map((milestone) => ({
                title: milestone.title,
                description: milestone.description,
                amount: milestone.amount,
                order: milestone.order,
              })),
            }
          : undefined,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(query: ListResearchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.researchProject.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.researchProject.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const research = await this.prisma.researchProject.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!research) {
      throw new NotFoundException('Research project not found');
    }

    return research;
  }
}
