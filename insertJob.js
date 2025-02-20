const axios = require('axios');

// Hàm tạo dữ liệu công việc ngẫu nhiên
const createJobData = (index) => ({
  user_id: '6779667db40c0d77a628f14b',
  title: `TANCA DEVELOPER ${index}`,
  description: `<p>Mô tả công việc ${index}</p>`,
  address: `Địa chỉ ${index}`,
  city_id: '6770b18dd28795aa1a1a8223',
  district_id: '6770b18dd28795aa1a1a7fd0',
  ward_id: '6770b18dd28795aa1a1a7fc2',
  salary_range: {},
  age_range: { min: 28, max: 65 },
  job_contract_type: '67793df8a1bfd4d09d374e5e',
  benefit: [`Lợi ích ${index}`],
  require_experience: [],
  level: '67793d7ca1bfd4d09d374dc8',
  type_money: '67793da3a1bfd4d09d374dfe',
  degree: '67793e12a1bfd4d09d374e65',
  expire_date: '2025-03-01',
  skills: [
    '677d20436ab1c6ce1646e511',
    '677d20566ab1c6ce1646e51d',
    '677d20516ab1c6ce1646e519',
  ],
  is_negotiable: true,
  count_apply: 1,
  apply_linkedin: `https://linkedin.com/apply${index}`,
  apply_website: '',
  apply_email: '',
  professional_skills: [
    { title: `Kỹ năng chuyên môn ${index}`, items: [`Kỹ năng ${index}`] },
  ],
  general_requirements: [{ requirement: `Yêu cầu chung ${index}` }],
  job_responsibilities: [{ responsibility: `Trách nhiệm công việc ${index}` }],
  interview_process: [{ process: `Quy trình phỏng vấn ${index}` }],
  job_type: '67793de4a1bfd4d09d374e58',
  min_experience: 2,
  skill_name: ['Spring', 'NestJs', 'Antd'],
  company_name: 'Tanca',
});

// Hàm gửi request POST để tạo công việc
const createJob = (data) => {
  const config = {
    method: 'post',
    url: 'http://localhost:8082/api/v1/jobs',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language':
        'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2Nzc5NjY3ZGI0MGMwZDc3YTYyOGYxNGIiLCJ1c2VybmFtZSI6ImZwdEBnbWFpbC5jb20iLCJyb2xlIjp7InJvbGVfcGVybWlzc2lvbiI6W10sIl9pZCI6IjY3NzBiMTkzYjUwZWVjYWNiYjhlMGM1ZSIsInJvbGVfbmFtZSI6IkVNUExPWUVSIn0sImlhdCI6MTc0MDAzMDg2NywiZXhwIjoxNzQwNjM1NjY3fQ.Ze2P0Cpt3SGsXZQR0r2mTPtqpTfpwiuzLkEoXwmanAc',
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
      Referer: 'http://localhost:5173/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'sec-ch-ua':
        '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    },
    data,
  };

  return axios(config)
    .then((response) => {
      console.log(`Job ${data.title} created successfully`);
    })
    .catch((error) => {
      console.error(`Error creating job ${data.title}:`, error);
    });
};

// Tạo 100 công việc
const createMultipleJobs = async () => {
  for (let i = 0; i <= 1; i++) {
    const jobData = createJobData(i);
    await createJob(jobData);
  }
};

// Bắt đầu tạo dữ liệu
createMultipleJobs();
