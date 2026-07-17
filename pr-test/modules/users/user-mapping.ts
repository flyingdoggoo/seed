import { DemoConfig } from "../../config";

export const nameMappings: Record<string, string> = {
	"Trang Tran (EG - CEO)": DemoConfig.LINE_MANAGER.FULLNAME,
	"MinhMai Phan (TMS - CPO)": "Linh Manager (EHUB - FL)",
	"Anh Nguyen (EG - HR)": "Kien Nguyen Enos (EHUB - HR)",
	"Tuyen Vo (EHUB - AM)": "nguyen nguyen (EHUB - HR)",
	"Tung Nguyen (EHUB - PMO)": "Le Ky Ba (EHUB - HR)",
	"Trinh Le (EG - HR)": "Hiếu HR (EHUB - HR)",
	"Sao Nguyen (EHUB - DS)": "Hiếu Nhân Viên (EHUB - EM)",
	[DemoConfig.PROJECT_MANAGER.FULLNAME]: "Tai Vo (EHUB - PM)",
	"Chinh Nguyen (EHUB - FE)": "adam trần (EHUB - FE)",
	"Dung Tran (TMS - FE)": "Tran Hoang Xuan Ba (EHUB - BE)",
	"Thuy Vo (EHUB - QA)": "Vo Duc Ba (EHUB - HR)",
	"Linh Do (EHUB - PDO Intern)": "Linh Do (ENS - PDO Intern)",
	"Dung Le (EHUB - BE)": "Ba Le (EHUB - FL)",
	"Phat Nguyen (EHUB - FE)": "Kien Nguyen (EHUB - FL)",
	[DemoConfig.LINE_MANAGER.FULLNAME]: "Tai Vo (EHUB - EM)",
};

export const emailMappings: Record<string, string> = {
	"trang.tran@ehub.com": DemoConfig.LINE_MANAGER.EMAIL,
	"minh.phan@ehub.com": "dklinh05@gmail.com",
	"anh.nguyen@ehub.com": "kien.nguyen@team.enosta.com",
	"tuyen.vo@ehub.com": "hoangnguyendepgiai@gmail.com",
	"tung.nguyen@ehub.com": "lekyba2000hc@gmail.com",
	"trinh.le@ehub.com": "thanhhieu.nguyen@team.enosta.com",
	"sao.nguyen@ehub.com": "itadadenhat@gmail.com",
	"ray.nguyen@ehub.com": "voductaitxqt123@gmail.com",
	"chinh.nguyen@team.ehub.com": "xoenggame1@gmail.com",
	"dungvan.tran@team.ehub.com": "pnv.familier@gmail.com",
	"thuy.vo@team.ehub.com": "ba.le26@student.passerellesnumeriques.org",
	"linh.do@team.ehub.com": "linh.do@team.enosta.com",
	"huudung.le@ehub.com": "ba.le@team.enosta.com",
	"phat.nguyen@ehub.com": "kien56162@gmail.com",
	[DemoConfig.LINE_MANAGER.EMAIL]: "tai.vo@team.enosta.com",
};

