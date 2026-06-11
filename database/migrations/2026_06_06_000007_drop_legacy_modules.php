<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            if (Schema::hasColumn('users', 'organogram_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropConstrainedForeignId('organogram_id');
                });
            }
            if (Schema::hasColumn('users', 'organization_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropConstrainedForeignId('organization_id');
                });
            }
        }

        Schema::dropIfExists('reconnection_application_fees');
        Schema::dropIfExists('reconnection_application_payments');
        Schema::dropIfExists('reconnection_application_histories');
        Schema::dropIfExists('reconnection_applications');

        Schema::dropIfExists('applications');

        Schema::dropIfExists('event_translations');
        Schema::dropIfExists('events');
        Schema::dropIfExists('publication_translations');
        Schema::dropIfExists('publications');
        Schema::dropIfExists('introduction_translations');
        Schema::dropIfExists('introductions');
        Schema::dropIfExists('blog_translations');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('feedback_translations');
        Schema::dropIfExists('feedbacks');
        Schema::dropIfExists('footer_translations');
        Schema::dropIfExists('footers');
        Schema::dropIfExists('slider_translations');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('top_navbars');

        Schema::dropIfExists('village_translations');
        Schema::dropIfExists('villages');
        Schema::dropIfExists('union_translations');
        Schema::dropIfExists('unions');
        Schema::dropIfExists('upazila_translations');
        Schema::dropIfExists('upazilas');
        Schema::dropIfExists('district_translations');
        Schema::dropIfExists('districts');

        Schema::dropIfExists('organogram_translations');
        Schema::dropIfExists('organograms');
        Schema::dropIfExists('organization_translations');
        Schema::dropIfExists('organizations');
    }

    public function down(): void
    {
        //
    }
};
