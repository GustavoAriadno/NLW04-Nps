import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/AppError";


class SendMailController {
	async execute(request: Request, response: Response) {
		const { email, survey_id } = request.body;

		const usersRepository = getCustomRepository(UsersRepository);
		const user = await usersRepository.findOne({ email });
		if (!user) throw new AppError("User doesn't exists!");

		const surveyRepository = getCustomRepository(SurveysRepository);
		const survey = await surveyRepository.findOne({ id: survey_id });
		if (!survey) throw new AppError("Survey doesn't exists!");

		const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

		const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

		const surveysUsersAlreadyExists = await surveysUsersRepository.findOne({
			where: { user_id: user.id, value: null },
			relations: ["user", "survey"]
		});

		const variables = {
			name: user.name,
			title: survey.title,
			description: survey.description,
			id: "",
			link: process.env.URL_MAIL
		};

		if (surveysUsersAlreadyExists) {
			variables.id = surveysUsersAlreadyExists.id
			await SendMailService.execute(email, survey.title, variables, npsPath);
			return response.json(surveysUsersAlreadyExists);
		}

		const surveyUser = surveysUsersRepository.create({
			user_id: user.id,
			survey_id
		});

		await surveysUsersRepository.save(surveyUser);

		variables.id = surveyUser.id;

		await SendMailService.execute(email, survey.title, variables, npsPath);

		return response.json(surveyUser);
	}
}


export { SendMailController }