<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use PHPUnit\Framework\TestCase;

class GenreUnitTest extends TestCase
{
    private $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = new Genre();
    }    
    
    public function testFillableAttribute()
    {              
        $fillable = ['name', 'is_active'];        
        $this->assertEquals($fillable, $this->genre->getFillable()
        );
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];        
        
        foreach($dates as $date) {
            $this->assertContains($date, $this->genre->getDates());
        }
        $this->assertCount(count($dates), $this->genre->getDates());
    }

    public function testCasts()
    {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];        
        $this->assertEquals($casts, $this->genre->getCasts());
    }

    public function testIncremeting()
    {        
        $this->assertFalse($this->genre->incrementing);
    }
}
