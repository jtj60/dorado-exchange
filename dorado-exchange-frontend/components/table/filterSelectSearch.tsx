'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Filter, Check } from 'lucide-react'
import { useRef, useState, useLayoutEffect } from 'react'
import { Column } from '@tanstack/react-table'

type TableSearchSelectProps<TData> = {
  column: Column<TData, unknown>
  options: string[]
  anchorRef: React.RefObject<HTMLElement | null>
  placeholder?: string
}

export function TableSearchSelect<TData>({
  column,
  options,
  anchorRef,
  placeholder = 'Search…',
}: TableSearchSelectProps<TData>) {
  const [open, setOpen] = useState(false)
  const selected = column.getFilterValue() as string | undefined
  const [width, setWidth] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    if (anchorRef.current) {
      setWidth(anchorRef.current.offsetWidth)
    }
  }, [anchorRef.current, open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn('p-0 hover:bg-transparent', selected && 'text-primary hover:text-primary')}
        >
          <Filter size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={4}
        className="p-0 bg-background z-50 w-48"
        onOpenAutoFocus={(e) => e.preventDefault()}
        style={{ width }}
      >
        <Command>
          <CommandInput placeholder={placeholder} className="border-b" />
          <CommandList className="max-h-52 overflow-y-auto">
            <CommandItem
              onSelect={() => {
                column.setFilterValue(undefined)
                setOpen(false)
              }}
              className="cursor-pointer"
            >
              <span>All</span>
              {!selected && <Check className="ml-auto h-4 w-4 opacity-100" />}
            </CommandItem>
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => {
                  column.setFilterValue(option)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                {option}
                <Check
                  className={cn(
                    'ml-auto h-4 w-4',
                    selected === option ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
