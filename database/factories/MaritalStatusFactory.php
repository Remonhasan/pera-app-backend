<?php

namespace Database\Factories;

use App\Models\MaritalStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaritalStatus>
 */
class MaritalStatusFactory extends Factory
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
      'title' => fake()->randomElement(['Single', 'Married', 'Divorced', 'Widowed']),
      'description' => fake()->optional()->sentence(),
      'status' => fake()->randomElement(['active', 'inactive']),
    ];
  }
}
