import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './schema/project.schema';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/User.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async create(createProjectDto: CreateProjectDto) {
    const project = await this.projectModel.create(createProjectDto);
    if (!project) {
      throw new BadRequestException('Create project failed');
    }
    const user = await this.userModel.findById(project.user_id);
    if (!user) {
      throw new NotFoundException(`user #${project.user_id} not found`);
    }
    const projectId = new Types.ObjectId(project._id + '');
    user.projects.push(projectId);
    await user.save();
    return project;
  }

  async findAll() {
    return this.projectModel.find();
  }

  async findOne(id: string) {
    return this.projectModel.findById(id);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const updateProject = await this.projectModel.findByIdAndUpdate(
      id,
      updateProjectDto,
      { new: true },
    );
    if (!updateProject) {
      throw new NotFoundException(`Projects #${id} not found`);
    }
    return updateProject;
  }

  async remove(id: string, userId: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Prize #${id} not found`);
    }
    if (project?.user_id === new Types.ObjectId(userId)) {
      throw new ForbiddenException(
        'You are not allowed to delete this project',
      );
    }

    const result = await this.projectModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Prize not found or could not be deleted');
    }

    await this.userModel.updateOne(
      { _id: project.user_id },
      { $pull: { projects: id } },
    );
  }
}
