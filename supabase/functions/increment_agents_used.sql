
-- Function to increment free_agents_used for a user
CREATE OR REPLACE FUNCTION public.increment_agents_used()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET free_agents_used = free_agents_used + 1
  WHERE id = auth.uid();
END;
$$;
