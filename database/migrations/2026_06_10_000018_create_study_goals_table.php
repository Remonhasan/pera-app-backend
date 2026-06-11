<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->foreignId('subject_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('topic_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->foreignId('job_id')
                ->nullable()
                ->constrained('job_types')
                ->nullOnDelete();
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->date('extended_date')->nullable();
            $table->boolean('status')->default(true);
            $table->string('study_goal_status')->default('pending');
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_goals');
    }
};
