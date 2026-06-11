<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $subjectLine,
        public readonly string $bodyText
    ) {}

    public function build()
    {
        return $this
            ->subject($this->subjectLine)
            ->text('emails.generic-text', [
                'bodyText' => $this->bodyText,
            ]);
    }
}

