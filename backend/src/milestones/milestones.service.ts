import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateMilestoneDto } from './dto/create-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateMilestoneDto, user: PublicUser) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can add milestones',
      );
    }

    try {
      return await this.prisma.milestone.create({
        data: {
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          order: dto.order,
          projectId: project.id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Milestone order already exists for this project',
        );
      }

      throw error;
    }
  }

  async findByProject(projectId: string) {
    await this.findProjectOrThrow(projectId);

    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async updateStatus(
    projectId: string,
    milestoneId: string,
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED',
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true, status: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (status === 'SUBMITTED') {
      if (project.creatorId !== user.id) {
        throw new ForbiddenException(
          'Only the project creator can submit milestones',
        );
      }
      if (milestone.status !== 'PENDING') {
        throw new BadRequestException(
          'Only PENDING milestones can be submitted',
        );
      }
    } else {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only admins can approve or reject milestones',
        );
      }
      if (milestone.status !== 'SUBMITTED') {
        throw new BadRequestException(
          'Only SUBMITTED milestones can be approved or rejected',
        );
      }
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status },
    });
  }

  private async findProjectOrThrow(projectId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    return project;
  }
}
