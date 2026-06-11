<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('reconnection_application_fees');
        Schema::dropIfExists('fee_translations');
        Schema::dropIfExists('fees');
    }

    public function down(): void
    {
        //
    }
};
