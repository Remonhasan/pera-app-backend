<?php

namespace Database\Factories;

use App\Models\EmploymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmploymentStatus>
 */
class EmploymentStatusFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'slug' => fake()->slug(),
      'title' => fake()->randomElement(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Unemployed', 'Retired']),
      'description' => fake()->optional()->sentence(),
      'status' => fake()->randomElement(['active', 'inactive']),
    ];
  }
}

