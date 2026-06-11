<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('type'); // e.g., 'teacher_application_submitted', 'school_application_submitted'
                $table->string('title');
                $table->text('message');
                $table->string('link')->nullable(); // URL to related resource
                $table->boolean('is_read')->default(false);
                $table->json('data')->nullable(); // Additional data as JSON
                $table->timestamps();

                $table->index(['user_id', 'is_read']);
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
