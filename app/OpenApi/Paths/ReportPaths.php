<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(path: '/reports/daily-expense', operationId: 'reportDailyExpense', summary: 'Daily expense report', tags: ['Reports'], parameters: [
    new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'expense_type_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'user_id', in: 'query', schema: new OA\Schema(type: 'integer')),
], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/daily-expense/export-pdf', operationId: 'reportDailyExpensePdf', summary: 'Export daily expense report as PDF', tags: ['Reports'], parameters: [
    new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'expense_type_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'user_id', in: 'query', schema: new OA\Schema(type: 'integer')),
], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/reports/expense-track', operationId: 'reportExpenseTrack', summary: 'Expense track report', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/expense-track/export-pdf', operationId: 'reportExpenseTrackPdf', summary: 'Export expense track report as PDF', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/reports/expense-target', operationId: 'reportExpenseTarget', summary: 'Expense target report', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/expense-target/export-pdf', operationId: 'reportExpenseTargetPdf', summary: 'Export expense target report as PDF', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/reports/savings', operationId: 'reportSavings', summary: 'Savings report', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/savings/export-pdf', operationId: 'reportSavingsPdf', summary: 'Export savings report as PDF', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/reports/study', operationId: 'reportStudy', summary: 'Study report', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/study/export-pdf', operationId: 'reportStudyPdf', summary: 'Export study report as PDF', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/reports/topicwise-study-goal', operationId: 'reportTopicwiseStudyGoal', summary: 'Topicwise study goal report', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'Report data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/reports/topicwise-study-goal/export-pdf', operationId: 'reportTopicwiseStudyGoalPdf', summary: 'Export topicwise study goal report as PDF', tags: ['Reports'], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
class ReportPaths
{
}
